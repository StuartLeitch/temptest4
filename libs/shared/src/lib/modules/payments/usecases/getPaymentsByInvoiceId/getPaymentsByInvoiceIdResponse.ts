import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payment } from '../../domain/Payment';

import * as Errors from './getPaymentsByInvoiceIdErrors';

export type GetPaymentsByInvoiceIdResponse = Either<
  | Errors.RetrievingPaymentsDbError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | UnexpectedError,
  Payment[]
>;
