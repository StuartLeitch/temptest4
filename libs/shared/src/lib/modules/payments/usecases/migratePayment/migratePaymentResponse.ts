import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { MigratePaymentErrors } from './migratePaymentErrors';

export type MigratePaymentResponse = Either<
  | MigratePaymentErrors.InvalidPayment
  | MigratePaymentErrors.PaymentNotFound
  | AppError.UnexpectedError,
  Result<void>
>;
