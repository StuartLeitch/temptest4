import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Payer } from '../../domain/Payer';

import { GetPayerDetailsByInvoiceIdErrors } from './getPayerDetailsByInvoiceIdErrors';

export type GetPayerDetailsByInvoiceIdResponse = Either<
  | GetPayerDetailsByInvoiceIdErrors.NoPayerFoundForInvoiceError
  | GetPayerDetailsByInvoiceIdErrors.InvoiceIdRequiredError
  | GetPayerDetailsByInvoiceIdErrors.FetchPayerFromDbError
  | AppError.UnexpectedError,
  Result<Payer>
>;
