import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './paypal-process-finished.errors';

export type PayPalProcessFinishedResponse = Either<
  | Errors.PaymentNotInCorrectStatusForTransitionToCompletedError
  | Errors.PayPalOrderStatusRequiredError
  | Errors.UpdatePaymentStatusDbError
  | Errors.OrderIdRequiredError
  | UnexpectedError,
  void
>;
