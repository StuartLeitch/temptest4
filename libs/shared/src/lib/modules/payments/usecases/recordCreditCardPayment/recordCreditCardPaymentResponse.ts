import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { RecordCreditCardPaymentErrors } from './recordCreditCardPaymentErrors';
import { RecordPaymentErrors } from '../recordPayment/recordPaymentErrors';
import { Payment } from '../../domain/Payment';

export type RecordCreditCardPaymentResponse = Either<
  | RecordCreditCardPaymentErrors.PaymentError
  | RecordPaymentErrors.InvalidPaymentAmount
  | AppError.UnexpectedError,
  Result<Payment>
>;
