import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Invoice } from '../../domain/Invoice';

import * as Errors from './changeInvoiceStatusErrors';

export type ChangeInvoiceStatusResponse = Either<
  | Errors.InvoiceNotFoundError
  | Errors.ChangeStatusError
  | UnexpectedError
  | GuardFailure,
  Invoice
>;
