import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payment } from '../../../payments/domain/Payment';
import * as Errors from './recordPaymentErrors';

export type RecordPaymentResponse = Either<
  | Errors.InvoiceTotalLessThanZeroError
  | Errors.PaymentDateRequiredError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFountError
  | Errors.PaymentUpdateDbError
  | UnexpectedError,
  Payment
>;
