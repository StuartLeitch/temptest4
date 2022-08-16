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
import format from 'date-fns/format';
import addMinutes from 'date-fns/addMinutes';
import { Invoice } from '../../domain/Invoice';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { GetArticleDetailsUsecase } from '../../../manuscripts/usecases/getArticleDetails/getArticleDetails';
import { GetPayerDetailsUsecase } from '../../../payers/usecases/getPayerDetails/getPayerDetails';
import { GetAddressUsecase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { GetReceiptPdfResponse as Response } from './getReceiptPdfResponse';
import * as Errors from './getReceiptErrors';
import type { GetReceiptPdfDTO as DTO } from './getReceiptPdfDTO';

import {
  PdfGeneratorService,
  ReceiptPayload,
} from '../../../../domain/services/PdfGenerator';

import { LoggerContract } from '../../../../infrastructure/logging';

import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';
import { GetPaymentInfoUsecase } from '../../../payments/usecases/getPaymentInfo';
import { PaymentRepoContract } from '../../../payments/repos';
import { JournalId } from '../../../journals/domain/JournalId';
import { CatalogRepoContract } from '../../../journals/repos';

export class GetReceiptPdfUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context>
{
  authorizationContext: Context;

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private addressRepo: AddressRepoContract,
    private articleRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private catalogRepo: CatalogRepoContract,
    private payerRepo: PayerRepoContract,
    private paymentRepo: PaymentRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private pdfGenerator: PdfGeneratorService,
    private logger: LoggerContract
  ) {
    super();

    this.getPayloadWithAddress = this.getPayloadWithAddress.bind(this);
    this.getPayloadWithInvoice = this.getPayloadWithInvoice.bind(this);
    this.getPayloadWithArticle = this.getPayloadWithArticle.bind(this);
    this.getPayloadWithPayer = this.getPayloadWithPayer.bind(this);
    this.getPayloadWithPayments = this.getPayloadWithPayments.bind(this);
    this.addJournalTitle = this.addJournalTitle.bind(this);
    this.generateThePdf = this.generateThePdf.bind(this);
  }

  @Authorize('invoice:getReceiptPDF')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    this.authorizationContext = context;
    const { payerId } = request;

    const emptyPayload: ReceiptPayload = {
      receiptLink: request.receiptLink,
      address: null,
      article: null,
      invoice: null,
      author: null,
      payer: null,
      payment: null,
    };

    const payloadExecution = await new AsyncEither(emptyPayload)
      .then(this.getPayloadWithPayer(payerId))
      .then(this.getPayloadWithAddress)
      .then(this.getPayloadWithInvoice)
      .then(this.getPayloadWithPayments)
      .then(this.getPayloadWithArticle)
      .then(this.addJournalTitle)
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
    payload: ReceiptPayload
  ): Promise<Either<Errors.PdfInvoiceError, Readable>> {
    try {
      const invoiceId = payload.invoice.id.toString();
      const paymentPath = 'payment-details/';
      const link = payload.receiptLink.concat(paymentPath, invoiceId);
      payload.receiptLink = link;

      const pdf = await this.pdfGenerator.getReceipt(payload);
      return right(pdf);
    } catch (error) {
      this.logger.error(error.message, error);
      return left(
        new Errors.PdfInvoiceError('empty pdf', payload.invoice.id.toString())
      );
    }
  }

  private addFileNameToResponse<A, B>(
    payloadEither: Either<A, ReceiptPayload>,
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
    return async (payload: ReceiptPayload) => {
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

  private async getPayloadWithAddress(payload: ReceiptPayload) {
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

  private async getPayloadWithPayments(payload: ReceiptPayload) {
    const invoiceId = payload.invoice.invoiceId.id.toString();
    const usecase = new GetPaymentInfoUsecase(
      this.invoiceRepo,
      this.paymentRepo
    );

    const paymentEither = await usecase.execute(
      { invoiceId },
      this.authorizationContext
    );

    if (paymentEither.isLeft()) {
      return left(new UnexpectedError(new Error(paymentEither.value.message)));
    }

    return paymentEither.map(
      ({ authorizationCode, cardLastDigits, paymentDate }) => {
        return {
          ...payload,
          authorizationCode,
          cardLastDigits,
          paymentDate: dateFormat(new Date(paymentDate)),
        };
      }
    );
  }

  private async getPayloadWithInvoice(
    payload: ReceiptPayload
  ): Promise<Either<UnexpectedError, ReceiptPayload>> {
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

  private async addJournalTitle<T extends ReceiptPayload>(
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

  private async getPayloadWithArticle(payload: ReceiptPayload) {
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
      return left<UnexpectedError, ReceiptPayload>(
        new UnexpectedError(
          new Error(
            `no APC found for the invoice with id ${payload.invoice.id.toString()}`
          )
        )
      );
    }
  }
}
function dateFormat(date: Date) {
  return format(
    addMinutes(date, date.getTimezoneOffset()),
    'dd MMM yyyy HH:mm'
  );
}
