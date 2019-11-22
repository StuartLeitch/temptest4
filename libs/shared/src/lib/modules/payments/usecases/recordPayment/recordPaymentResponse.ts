import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { RecordPaymentErrors } from './recordPaymentErrors';
import { Payment } from '../../../payments/domain/Payment';

export type RecordPaymentResponse = Either<
  RecordPaymentErrors.InvalidPaymentAmount | AppError.UnexpectedError,
  Result<Payment>
>;
