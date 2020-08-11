import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result } from '../../../../core/logic/Result';

import { GetArticleDetailsErrors } from '../../../manuscripts/usecases/getArticleDetails/getArticleDetailsErrors';
import { GetAuthorDetailsErrors } from '../../../authors/usecases/getAuthorDetails/getAuthorDetailsErrors';
import { GetPayerDetailsErrors } from '../../../payers/usecases/getPayerDetails/getPayerDetailsErrors';
import { GetInvoiceDetailsErrors } from '../getInvoiceDetails/getInvoiceDetailsErrors';

export namespace GetInvoicePdfErrors {
  export class PdfInvoiceError extends Result<UseCaseError> {
    constructor(message: string, invoiceId: string) {
      super(false, {
        message: `Error when generating the pdf for invoice with id {${invoiceId}}, with error message: ${message}`,
      });
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
