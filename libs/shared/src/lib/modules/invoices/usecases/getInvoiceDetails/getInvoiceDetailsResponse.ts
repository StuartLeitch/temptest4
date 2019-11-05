import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../.././core/logic/AppError';

import {GetInvoiceDetailsErrors} from './getInvoiceDetailsErrors';
import {Invoice} from './../../domain/Invoice';

export type GetInvoiceDetailsResponse = Either<
  | GetInvoiceDetailsErrors.InvoiceNotFoundError
  | AppError.UnexpectedError
  | Result<any>,
  Result<Invoice>
>;
