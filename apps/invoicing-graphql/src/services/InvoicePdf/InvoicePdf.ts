import streamToPromise from 'stream-to-promise';

import {pdfGeneratorService} from '../PdfGenerator';
import {InvoicePayload} from '../PdfGenerator/PdfGenerator';
import {
  PayerMap,
  ArticleMap,
  AuthorMap,
  PayerType,
  Invoice,
  Article,
  Author,
  Payer,
  GetInvoiceDetailsUsecase,
  KnexInvoiceRepo,
  Roles,
  AuthorizationContext
} from '@hindawi/shared';

import {
  Either,
  left,
  right,
  Result
} from '../../../../../libs/shared/src/lib/core/logic/Result';

export class InvoicePdfService {
  constructor(private invoiceRepo: KnexInvoiceRepo) {}

  async getPdf(invoiceId: string) {
    const invoicePayload = await this.constructPayload(invoiceId);
    if (invoicePayload.isLeft()) {
      return invoicePayload;
    }
    const stream = await pdfGeneratorService.getInvoice(
      invoicePayload.value.getValue()
    );
    const pdf = await streamToPromise(stream);
    return right(Result.ok(pdf));
  }

  private async constructPayload(invoiceId: string) {
    const usecaseContext = {
      roles: [Roles.PAYER]
    };
    const article = await this.getArticleDetails(invoiceId, usecaseContext);
    const invoice = await this.getInvoiceDetails(invoiceId, usecaseContext);
    const author = await this.getAuthorDetails(invoiceId, usecaseContext);
    const payer = await this.getPayerDetails(invoiceId, usecaseContext);
    const eitherPayload = {
      article,
      invoice,
      author,
      payer
    };

    const emptyPayload: Either<Error, Result<InvoicePayload>> = right(
      Result.ok({
        article: null,
        invoice: null,
        author: null,
        payer: null
      })
    );

    const a = Object.entries(eitherPayload).reduce((acc, [key, value]) => {
      if (acc.isLeft()) {
        return acc;
      }
      if (value.isLeft()) {
        return value;
      }
      const tmp = acc.value.getValue();
      tmp[key] = value.value.getValue();
      return right(Result.ok(tmp));
    }, emptyPayload);

    return Promise.resolve(a);
  }

  private async getInvoiceDetails(
    invoiceId: string,
    authorizationContext: AuthorizationContext<Roles>
  ) {
    const usecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const result = await usecase.execute({invoiceId}, authorizationContext);
    return result;
  }

  private async getAuthorDetails(
    invoiceId: string,
    authorizationContext: AuthorizationContext<Roles>
  ) {
    return Promise.resolve(
      right<Error, Result<Author>>(
        Result.ok(
          AuthorMap.toDomain({
            id: 'author-1',
            name: 'Luke Skywalker'
          })
        )
      )
    );
  }

  private async getArticleDetails(
    invoiceId: string,
    authorizationContext: AuthorizationContext<Roles>
  ) {
    return Promise.resolve(
      right<Error, Result<Article>>(
        Result.ok(
          ArticleMap.toDomain({
            id: 'article-1',
            title: 'Death Star critical flaw white paper',
            articleTypeId: 'type1'
          })
        )
      )
    );
  }

  private async getPayerDetails(
    invoiceId: string,
    authorizationContext: AuthorizationContext<Roles>
  ) {
    return Promise.resolve(
      right<Error, Result<Payer>>(
        Result.ok(
          PayerMap.toDomain({
            id: 'payer-1',
            type: PayerType.INDIVIDUAL,
            name: 'Darth Vader',
            invoiceId: invoiceId
          })
        )
      )
    );
  }
}
