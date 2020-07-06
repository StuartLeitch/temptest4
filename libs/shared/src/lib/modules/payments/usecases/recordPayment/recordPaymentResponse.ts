import { AppError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Result';

import { Payment } from '../../../payments/domain/Payment';
import * as Errors from './recordPaymentErrors';

export type RecordPaymentResponse = Either<
  | Errors.PayerIdentificationRequiredError
  | Errors.InvoiceTotalLessThanZeroError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFountError
  | AppError.UnexpectedError,
  Payment
>;
