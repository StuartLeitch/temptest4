import streamToPromise from 'stream-to-promise';

import {pdfGeneratorService} from '../PdfGenerator';
import {InvoicePayload} from '../PdfGenerator/PdfGenerator';
import {
  GetArticleDetailsUsecase,
  GetAuthorDetailsUsecase,
  GetInvoiceDetailsUsecase,
  GetPayerDetailsUsecase,
  KnexInvoiceRepo,
  KnexPayerRepo,
  AuthorizationContext,
  Invoice,
  Author,
  Article,
  Payer,
  ManuscriptId,
  AuthorMap,
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

  private async constructPayload(invoiceId: string) {
    const invoicePayload: InvoicePayload = {
      article: null,
      invoice: null,
      author: null,
      payer: null
    };

    const invoiceResult = await this.getInvoiceDetails(invoiceId);
    if (invoiceResult.isLeft()) return invoiceResult;
    invoicePayload.invoice = invoiceResult.value.getValue();
    console.log(invoicePayload.invoice);

    const payerResult = await this.getPayerDetails(invoicePayload.invoice);
    if (payerResult.isLeft()) return payerResult;
    invoicePayload.payer = payerResult.value.getValue();

    const apcItems = invoicePayload.invoice.invoiceItems.currentItems.filter(
      item => item.type === 'APC'
    );
    if (apcItems.length > 0) {
      const articleResult = await this.getArticleDetails(
        apcItems[0].manuscriptId
      );
      if (articleResult.isLeft()) return articleResult;
      invoicePayload.article = articleResult.value.getValue();
    }

    invoicePayload.author = await this.getAuthorDetails(invoicePayload.article);

    return invoicePayload;
  }

  async getPdf(invoiceId: string) {
    const invoicePayload = await this.constructPayload(invoiceId);
    if ('isLeft' in invoicePayload) {
      return invoicePayload;
    }
    const stream = await pdfGeneratorService.getInvoice(invoicePayload);
    const pdf = await streamToPromise(stream);
    return pdf;
  }

  private async getInvoiceDetails(invoiceId: string) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const result = await usecase.execute(
      {invoiceId},
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

  private async getPayerDetails(invoice: Invoice) {
    const usecase = new GetPayerDetailsUsecase(this.payerRepo);
    const result = await usecase.execute(
      {payerId: invoice.payerId.id.toString()},
      this.authorizationContext
    );
    return result;
  }
}
