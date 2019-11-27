import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { RecordPaymentErrors } from '../recordPayment/recordPaymentErrors';
import { RecordPayPalPaymentErrors } from './recordPayPalPaymentErrors';
import { Payment } from '../../domain/Payment';

export type RecordPayPalPaymentResponse = Either<
  | RecordPayPalPaymentErrors.InvalidPayment
  | RecordPayPalPaymentErrors.PaymentNotFond
  | RecordPaymentErrors.InvalidPaymentAmount
  | AppError.UnexpectedError,
  Result<Payment>
>;
