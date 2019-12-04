// * Core Domain
import { Result, Either, left, right } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';
import { chain } from '../../../../core/logic/EitherChain';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import streamToPromise from 'stream-to-promise';

import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { InvoiceRepoContract } from '../../repos/invoiceRepo';

import { Invoice } from '../../domain/Invoice';

import { GetInvoicePdfResponse, PdfResponse } from './getInvoicePdfResponse';
import { GetInvoicePdfErrors } from './getInvoicePdfErrors';
import { GetInvoicePdfDTO } from './getInvoicePdfDTO';

import { GetArticleDetailsUsecase } from '../../../manuscripts/usecases/getArticleDetails/getArticleDetails';
import { GetAuthorDetailsUsecase } from '../../../authors/usecases/getAuthorDetails/getAuthorDetails';
import { GetPayerDetailsUsecase } from '../../../payers/usecases/getPayerDetails/getPayerDetails';
import { GetAddressUseCase } from '../../../addresses/usecases/getAddress/getAddress';
import { GetItemsForInvoiceUsecase } from '../getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../getInvoiceDetails/getInvoiceDetails';

import { InvoicePayload } from '../../../../domain/services/PdfGenerator/PdfGenerator';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { pdfGeneratorService } from '../../../../domain/services';
import { ArticleRepoContract } from '../../../manuscripts/repos';
import { VATService } from '../../../../domain/services/VATService';
import { ExchangeRateService } from '../../../../domain/services/ExchangeRateService';

import { PayerType } from 'libs/shared/src/lib/modules/payers/domain/Payer';

export type GetInvoicePdfContext = AuthorizationContext<Roles>;

export class GetInvoicePdfUsecase
  implements
    UseCase<
      GetInvoicePdfDTO,
      Promise<GetInvoicePdfResponse>,
      GetInvoicePdfContext
    >,
    AccessControlledUsecase<
      GetInvoicePdfDTO,
      GetInvoicePdfContext,
      AccessControlContext
    > {
  authorizationContext: AuthorizationContext<Roles>;

  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private addressRepo: AddressRepoContract,
    private articleRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract
  ) {}

  // @Authorize('payer:read')
  public async execute(
    request: GetInvoicePdfDTO,
    context?: GetInvoicePdfContext
  ): Promise<GetInvoicePdfResponse> {
    this.authorizationContext = context;
    const { payerId } = request;
    const emptyPayload: InvoicePayload = {
      invoiceLink: request.invoiceLink,
      address: null,
      article: null,
      invoice: null,
      author: null,
      payer: null
    };

    const payloadEither = await chain(
      [
        this.getPayloadWithPayer(payerId).bind(this),
        this.getPayloadWithAddress.bind(this),
        this.getPayloadWithInvoice.bind(this),
        this.getPayloadWithArticle.bind(this),
        this.getPayloadWithAuthor.bind(this)
      ],
      emptyPayload
    );

    const vatService = new VATService();
    const exchangeRateService = new ExchangeRateService();

    let rate = 1.42; // ! Average value for the last seven years

    const payloadWithVatNote = await map(
      [
        async payload => {
          const { template } = vatService.getVATNote(
            payload.address.country,
            payload.payer.type !== PayerType.INSTITUTION
          );

          if (payload && payload.invoice && payload.invoice.dateIssued) {
            const exchangeRate = await exchangeRateService.getExchangeRate(
              new Date(payload.invoice.dateIssued),
              'USD'
            );
            rate = exchangeRate.exchangeRate;
          }

          payload.invoice.props.rate = Math.round(rate * 100) / 100;
          payload.invoice.props.vatnote = template;

          return payload;
        }
      ],
      payloadEither
    );

    const pdfStreamEither = payloadWithVatNote.chain(
      this.generateThePdf.bind(this)
    );

    const pdfEither: any = await map([streamToPromise], pdfStreamEither);

    return this.addFileNameToResponse(payloadEither, pdfEither).map(pdf =>
      Result.ok(pdf)
    ) as GetInvoicePdfResponse;
  }

  private generateThePdf(payload: InvoicePayload) {
    try {
      const pdf = pdfGeneratorService.getInvoice(payload);
      return right(pdf);
    } catch (e) {
      console.log(e);
      return left(
        new GetInvoicePdfErrors.PdfInvoiceError(
          'empty pdf',
          payload.invoice.id.toString()
        )
      );
    }
  }

  private addFileNameToResponse(
    payloadEither: Either<any, InvoicePayload>,
    pdfEither: Either<any, Buffer>
  ) {
    return payloadEither.chain<Buffer | PdfResponse>(payload => {
      return pdfEither.map<PdfResponse>(pdf => {
        const date = payload.invoice.dateCreated;
        const parsedDate = `${date.getUTCFullYear()}-${date.getUTCMonth() +
          1}-${date.getUTCDate()}`;

        return {
          fileName: `${payload.invoice.id}-${parsedDate}.pdf`,
          file: pdf
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
      return payerEither.map(payerResult => ({
        ...payload,
        payer: payerResult.getValue()
      }));
    };
  }

  private async getPayloadWithAddress(payload: InvoicePayload) {
    const { billingAddressId } = payload.payer;
    const usecase = new GetAddressUseCase(this.addressRepo);
    const addressEither = await usecase.execute({
      billingAddressId: billingAddressId.id.toString()
    });

    return addressEither.map(addressResult => ({
      ...payload,
      address: addressResult.getValue()
    }));
  }

  private async getInvoiceItems(invoiceId: string) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.invoiceRepo
    );
    const itemsEither = await usecase.execute({ invoiceId });
    return itemsEither;
  }

  private async addItemsForInvoice(
    invoiceId: string,
    invoiceResult: Result<Invoice>
  ) {
    const invoice = invoiceResult.getValue();
    const itemsEither = await this.getInvoiceItems(invoiceId);
    const invoiceEither = itemsEither
      .map(itemsResult =>
        itemsResult.getValue().map(item => invoice.addInvoiceItem(item))
      )
      .map(() => Result.ok(invoice));
    return invoiceEither;
  }

  private async getPayloadWithInvoice(payload: InvoicePayload) {
    const invoiceId = payload.payer.invoiceId.id.toString();
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const invoiceEither = await usecase.execute(
      { invoiceId },
      this.authorizationContext
    );
    const invoiceWithItems = await chain(
      [this.addItemsForInvoice.bind(this, invoiceId)],
      invoiceEither
    );

    return invoiceWithItems.map(invoiceResult => ({
      ...payload,
      invoice: invoiceResult.getValue()
    }));
  }

  private getArticleId(invoice: Invoice): Either<string, string> {
    const apcItems = invoice.invoiceItems.currentItems.filter(
      item => item.type === 'APC'
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
      return articleEither.map(articleResult => ({
        ...payload,
        article: articleResult.getValue()
      }));
    } else {
      return left<AppError.UnexpectedError, InvoicePayload>(
        Result.fail({
          message: `no APC found for the invoice with id ${payload.invoice.id.toString()}`
        })
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
    return authorEither.map(authorResult => ({
      ...payload,
      author: authorResult.getValue()
    }));
  }
}
