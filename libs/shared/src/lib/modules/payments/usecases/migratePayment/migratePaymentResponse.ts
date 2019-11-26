import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { MigratePaymentErrors } from './migratePaymentErrors';

import { Payment } from '../../domain/Payment';

export type MigratePaymentResponse = Either<
  | MigratePaymentErrors.InvalidPayment
  | MigratePaymentErrors.PaymentNotFound
  | AppError.UnexpectedError,
  Result<Payment>
>;
