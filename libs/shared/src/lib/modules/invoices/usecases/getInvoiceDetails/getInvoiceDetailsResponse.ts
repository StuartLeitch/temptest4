import { UnexpectedError } from '../../../.././core/logic/AppError';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './getInvoiceDetailsErrors';
import { Invoice } from './../../domain/Invoice';

export type GetInvoiceDetailsResponse = Either<
  Errors.InvoiceNotFoundError | UnexpectedError | GuardFailure,
  Invoice
>;
