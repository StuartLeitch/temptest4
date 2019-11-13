import streamToPromise from 'stream-to-promise';

import {pdfGeneratorService} from '../PdfGenerator';
import {InvoicePayload} from '../PdfGenerator/PdfGenerator';
import {
  GetArticleDetailsUsecase,
  GetAuthorDetailsUsecase,
  GetInvoiceDetailsUsecase,
  GetPayerDetailsUsecase,
  AuthorizationContext,
  KnexInvoiceRepo,
  KnexPayerRepo,
  ManuscriptId,
  AuthorMap,
  Article,
  Payer,
  Roles
} from '@hindawi/shared';

export class InvoicePdfService {
  authorizationContext: AuthorizationContext<Roles> = {
    roles: [Roles.PAYER]
  };

  constructor(
    private invoiceRepo: KnexInvoiceRepo,
    private payerRepo: KnexPayerRepo
  ) {}

  private async constructPayload(payerId: string) {
    const invoicePayload: InvoicePayload = {
      article: null,
      invoice: null,
      author: null,
      payer: null
    };

    const payerEither = await this.getPayerDetails(payerId);
    if (payerEither.isLeft()) return payerEither;
    invoicePayload.payer = payerEither.value.getValue();

    const invoiceEither = await this.getInvoiceDetails(invoicePayload.payer);
    if (invoiceEither.isLeft()) return invoiceEither;
    invoicePayload.invoice = invoiceEither.value.getValue();

    const apcItems = invoicePayload.invoice.invoiceItems.currentItems.filter(
      item => item.type === 'APC'
    );
    if (apcItems.length > 0) {
      const articleEither = await this.getArticleDetails(
        apcItems[0].manuscriptId
      );
      if (articleEither.isLeft()) return articleEither;
      invoicePayload.article = articleEither.value.getValue();
    }

    invoicePayload.author = await this.getAuthorDetails(invoicePayload.article);

    return invoicePayload;
  }

  async getPdf(payerId: string) {
    const invoicePayload = await this.constructPayload(payerId);
    if ('isLeft' in invoicePayload) {
      return invoicePayload;
    }
    const stream = await pdfGeneratorService.getInvoice(invoicePayload);
    const pdf = await streamToPromise(stream);
    return pdf;
  }

  private async getInvoiceDetails(payer: Payer) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const result = await usecase.execute(
      {invoiceId: payer.invoiceId.id.toString()},
      this.authorizationContext
    );
    return result;
  }

  private async getAuthorDetails(article: Article) {
    // const usecase = new GetAuthorDetailsUsecase();
    // const result = await usecase.execute({authorId}, this.authorizationContext);
    // return result;
    return AuthorMap.toDomain({
      id: '',
      name: article.authorSurname
    });
  }

  private async getArticleDetails(articleId: ManuscriptId) {
    const usecase = new GetArticleDetailsUsecase();
    const result = await usecase.execute(
      {articleId: articleId.id.toString()},
      this.authorizationContext
    );
    return result;
  }

  private async getPayerDetails(payerId: string) {
    const usecase = new GetPayerDetailsUsecase(this.payerRepo);
    const result = await usecase.execute({payerId}, this.authorizationContext);
    return result;
  }
}
