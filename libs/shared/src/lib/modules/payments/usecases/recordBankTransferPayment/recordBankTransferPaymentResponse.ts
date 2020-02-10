import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { RecordBankTransferPaymentErrors } from './recordBankTransferPaymentErrors';
import { RecordPaymentErrors } from '../recordPayment/recordPaymentErrors';
import { Payment } from '../../domain/Payment';

export type RecordBankTransferPaymentResponse = Either<
  | RecordBankTransferPaymentErrors.PaymentError
  | RecordPaymentErrors.InvalidPaymentAmount
  | AppError.UnexpectedError,
  Result<Payment>
>;
