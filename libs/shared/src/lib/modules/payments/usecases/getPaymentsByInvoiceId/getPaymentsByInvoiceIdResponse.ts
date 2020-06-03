import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Payment } from '../../domain/Payment';

import * as Errors from './getPaymentsByInvoiceIdErrors';

export type GetPaymentsByInvoiceIdResponse = Either<
  | Errors.RetrievingPaymentsDbError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<Payment[]>
>;
