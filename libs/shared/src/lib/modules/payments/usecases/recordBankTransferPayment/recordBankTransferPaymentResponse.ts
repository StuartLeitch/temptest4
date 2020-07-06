import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { RecordBankTransferPaymentErrors } from './recordBankTransferPaymentErrors';
import { Payment } from '../../domain/Payment';

export type RecordBankTransferPaymentResponse = Either<
  RecordBankTransferPaymentErrors.PaymentError | AppError.UnexpectedError,
  Result<Payment>
>;
