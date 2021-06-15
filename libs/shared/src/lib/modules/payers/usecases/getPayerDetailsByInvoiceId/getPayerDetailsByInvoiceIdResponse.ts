import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payer } from '../../domain/Payer';

import * as Errors from './getPayerDetailsByInvoiceIdErrors';

export type GetPayerDetailsByInvoiceIdResponse = Either<
  | Errors.NoPayerFoundForInvoiceError
  | Errors.InvoiceIdRequiredError
  | Errors.FetchPayerFromDbError
  | UnexpectedError,
  Payer
>;
