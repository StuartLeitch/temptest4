import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetArticleDetailsErrors } from '../../../manuscripts/usecases/getArticleDetails';
import { GetAuthorDetailsErrors } from '../../../authors/usecases/getAuthorDetails';
import { GetPayerDetailsErrors } from '../../../payers/usecases/getPayerDetails';
import { GetInvoiceDetailsErrors } from '../getInvoiceDetails';

export namespace GetInvoicePdfErrors {
  export class PdfInvoiceError extends UseCaseError {
    constructor(message: string, invoiceId: string) {
      super(
        `Error when generating the pdf for invoice with id {${invoiceId}}, with error message: ${message}`
      );
    }
  }
}

export type GetInvoicePdfAllErrors =
  | GetArticleDetailsErrors.ArticleNotFoundError
  | GetInvoiceDetailsErrors.InvoiceNotFoundError
  | GetAuthorDetailsErrors.AuthorNotFoundError
  | GetPayerDetailsErrors.PayerNotFoundError
  | GetInvoicePdfErrors.PdfInvoiceError
  | UnexpectedError;
