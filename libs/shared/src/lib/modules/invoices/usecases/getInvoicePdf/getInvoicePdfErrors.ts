import {AppError} from '../../../../core/logic/AppError';

import {GetArticleDetailsErrors} from '../../../articles/usecases/getArticleDetails/getArticleDetailsErrors';
import {GetAuthorDetailsErrors} from '../../../authors/usecases/getAuthorDetails/getAuthorDetailsErrors';
import {GetPayerDetailsErrors} from '../../../payers/usecases/getPayerDetails/getPayerDetailsErrors';
import {GetInvoiceDetailsErrors} from '../getInvoiceDetails/getInvoiceDetailsErrors';

export type GetInvoicePdfErrors =
  | GetArticleDetailsErrors.ArticleNotFoundError
  | GetInvoiceDetailsErrors.InvoiceNotFoundError
  | GetAuthorDetailsErrors.AuthorNotFoundError
  | GetPayerDetailsErrors.PayerNotFoundError
  | AppError.UnexpectedError;
