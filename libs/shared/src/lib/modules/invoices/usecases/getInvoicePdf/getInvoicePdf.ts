import streamToPromise from 'stream-to-promise';
import { Readable } from 'stream';

// * Core Domain
import { UniqueEntityID } from './../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

// * Usecase specific
import { Invoice } from '../../domain/Invoice';
import { JournalId } from './../../../journals/domain/JournalId';

import { CatalogRepoContract } from './../../../journals/repos/catalogRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetArticleDetailsUsecase } from '../../../manuscripts/usecases/getArticleDetails/getArticleDetails';
import { GetAuthorDetailsUsecase } from '../../../authors/usecases/getAuthorDetails/getAuthorDetails';
import { GetPayerDetailsUsecase } from '../../../payers/usecases/getPayerDetails/getPayerDetails';
import { GetAddressUsecase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { GetInvoicePdfResponse as Response } from './getInvoicePdfResponse';
import { GetInvoicePdfErrors as Errors } from './getInvoicePdfErrors';
import type { GetInvoicePdfDTO as DTO } from './getInvoicePdfDTO';

import {
  PdfGeneratorService,
  InvoicePayload,
} from '../../../../domain/services/PdfGenerator';

import { ExchangeRateServiceContract } from '../../../exchange-rate/services/exchangeRateService';
import { VATService } from '../../../../domain/services/VATService';

import { LoggerContract } from '../../../../infrastructure/logging';

import { PayerType } from '../../../payers/domain/Payer';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

export class GetInvoicePdfUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  authorizationContext: Context;

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private addressRepo: AddressRepoContract,
    private articleRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private catalogRepo: CatalogRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private pdfGenerator: PdfGeneratorService,
    private logger: LoggerContract,
    private exchangeRateService: ExchangeRateServiceContract,
    private vatService: VATService
  ) {
    super();

    this.getPayloadWithAddress = this.getPayloadWithAddress.bind(this);
    this.getPayloadWithInvoice = this.getPayloadWithInvoice.bind(this);
    this.getPayloadWithArticle = this.getPayloadWithArticle.bind(this);
    this.getPayloadWithAuthor = this.getPayloadWithAuthor.bind(this);
    this.getPayloadWithPayer = this.getPayloadWithPayer.bind(this);
    this.addExchangeRate = this.addExchangeRate.bind(this);
    this.addJournalTitle = this.addJournalTitle.bind(this);
    this.generateThePdf = this.generateThePdf.bind(this);
  }

  @Authorize('invoice:getPDF')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    this.authorizationContext = context;
    const { payerId } = request;

    const emptyPayload: InvoicePayload = {
      invoiceLink: request.invoiceLink,
      address: null,
      article: null,
      invoice: null,
      author: null,
      payer: null,
    };

    const payloadExecution = await new AsyncEither(emptyPayload)
      .then(this.getPayloadWithPayer(payerId))
      .then(this.getPayloadWithAddress)
      .then(this.getPayloadWithInvoice)
      .then(this.getPayloadWithArticle)
      .then(this.getPayloadWithAuthor)
      .then(this.addJournalTitle)
      .then(this.addExchangeRate)
      .execute();

    const pdfExecution = await new AsyncEither(null)
      .then(async () => payloadExecution)
      .then(this.generateThePdf)
      .then(async (stream): Promise<Either<UnexpectedError, Buffer>> => {
        try {
          const result = await streamToPromise(stream);
          return right(result);
        } catch (err) {
          return left(new UnexpectedError(err));
        }
      })
      .execute();

    return this.addFileNameToResponse(payloadExecution, pdfExecution);
  }

  private async generateThePdf(
    payload: InvoicePayload
  ): Promise<Either<Errors.PdfInvoiceError, Readable>> {
    try {
      const invoiceId = payload.invoice.id.toString();
      const paymentPath = 'payment-details/';
      const link = payload.invoiceLink.concat(paymentPath, invoiceId);
      payload.invoiceLink = link;

      const pdf = await this.pdfGenerator.getInvoice(payload);
      return right(pdf);
    } catch (error) {
      this.logger.error(error.message, error);
      return left(
        new Errors.PdfInvoiceError('empty pdf', payload.invoice.id.toString())
      );
    }
  }

  private async addJournalTitle<T extends InvoicePayload>(
    payload: T
  ): Promise<Either<UnexpectedError, T>> {
    const maybeCatalogItem = await this.catalogRepo.getCatalogItemByJournalId(
      JournalId.create(new UniqueEntityID(payload.article.props.journalId))
    );

    if (maybeCatalogItem.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeCatalogItem.value.message))
      );
    }

    const catalogItem = maybeCatalogItem.value;

    if (payload.article) {
      payload.article.props.journalTitle = catalogItem.journalTitle;
    }

    return right(payload);
  }

  private async addExchangeRate(
    payload: InvoicePayload
  ): Promise<Either<UnexpectedError, InvoicePayload>> {
    try {
      const { template } = this.vatService.getVATNote(
        {
          postalCode: payload.address.postalCode,
          countryCode: payload.address.country,
          stateCode: payload.address.state,
        },
        payload.payer.type !== PayerType.INSTITUTION,
        new Date(payload.invoice.dateIssued)
      );

      const exchangeDate = payload?.invoice?.dateIssued
        ? new Date(payload?.invoice?.dateIssued)
        : null;
      const exchangeRate = await this.exchangeRateService.getExchangeRate(
        exchangeDate
      );
      this.logger.info('PublishInvoiceToERP exchangeRate', exchangeRate);

      const rate = exchangeRate.exchangeRate;

      payload.invoice.props.rate = Math.round(rate * 10000) / 10000;
      payload.invoice.props.vatnote = template;

      return right(payload);
    } catch (error) {
      this.logger.error('PublishInvoiceToERP exchangeRate', error);
      return left(new UnexpectedError(error));
    }
  }

  private addFileNameToResponse<A, B>(
    payloadEither: Either<A, InvoicePayload>,
    pdfEither: Either<B, Buffer>
  ) {
    return payloadEither.chain((payload) => {
      return pdfEither.map((pdf) => {
        const date = payload.invoice.dateCreated;
        const parsedDate = `${date.getUTCFullYear()}-${
          date.getUTCMonth() + 1
        }-${date.getUTCDate()}`;

        return {
          fileName: `${payload.invoice.id}-${parsedDate}.pdf`,
          file: pdf,
        };
      });
    });
  }

  private getPayloadWithPayer(payerId: string) {
    return async (payload: InvoicePayload) => {
      const usecase = new GetPayerDetailsUsecase(this.payerRepo);
      const payerEither = await usecase.execute(
        { payerId },
        this.authorizationContext
      );
      return payerEither.map((payer) => ({
        ...payload,
        payer,
      }));
    };
  }

  private async getPayloadWithAddress(payload: InvoicePayload) {
    const { billingAddressId } = payload.payer;
    const usecase = new GetAddressUsecase(this.addressRepo);
    const addressEither = await usecase.execute(
      {
        billingAddressId: billingAddressId.id.toString(),
      },
      this.authorizationContext
    );

    return addressEither.map((address) => ({
      ...payload,
      address,
    }));
  }

  private async getInvoiceItems(invoiceId: string) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );
    const itemsEither = await usecase.execute(
      { invoiceId },
      this.authorizationContext
    );
    return itemsEither;
  }

  private async addItemsForInvoice(invoiceId: string, invoiceResult: Invoice) {
    const invoice = invoiceResult;
    const itemsEither = await this.getInvoiceItems(invoiceId);
    const invoiceEither = itemsEither
      .map((itemsResult) =>
        itemsResult.map((item) => invoice.addInvoiceItem(item))
      )
      .map(() => invoice);
    return invoiceEither;
  }

  private async getPayloadWithInvoice(
    payload: InvoicePayload
  ): Promise<Either<UnexpectedError, InvoicePayload>> {
    const invoiceId = payload.payer.invoiceId.id.toString();
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const invoiceEither = await usecase.execute(
      { invoiceId },
      this.authorizationContext
    );

    if (invoiceEither.isLeft()) {
      return left(new UnexpectedError(new Error(invoiceEither.value.message)));
    }

    const invoiceWithItems = await this.addItemsForInvoice(
      invoiceId,
      invoiceEither.value
    );

    return invoiceWithItems.map((invoice) => ({
      ...payload,
      invoice,
    }));
  }

  private getArticleId(invoice: Invoice): Either<string, string> {
    const apcItems = invoice.invoiceItems.currentItems.filter(
      (item) => item.type === 'APC'
    );
    if (apcItems.length > 0) {
      return right(apcItems[0].manuscriptId.id.toString());
    } else {
      return left('');
    }
  }

  private async getPayloadWithArticle(payload: InvoicePayload) {
    const articleIdEither = this.getArticleId(payload.invoice);

    if (articleIdEither.isRight()) {
      const usecase = new GetArticleDetailsUsecase(this.articleRepo);
      const articleEither = await usecase.execute(
        { articleId: articleIdEither.value },
        this.authorizationContext
      );
      return articleEither.map((article) => ({
        ...payload,
        article,
      }));
    } else {
      return left<UnexpectedError, InvoicePayload>(
        new UnexpectedError(
          new Error(
            `no APC found for the invoice with id ${payload.invoice.id.toString()}`
          )
        )
      );
    }
  }

  private async getPayloadWithAuthor(payload: InvoicePayload) {
    const { article } = payload;
    const usecase = new GetAuthorDetailsUsecase();
    const authorEither = await usecase.execute(
      { article },
      this.authorizationContext
    );
    return authorEither.map((author) => ({
      ...payload,
      author,
    }));
  }
}
