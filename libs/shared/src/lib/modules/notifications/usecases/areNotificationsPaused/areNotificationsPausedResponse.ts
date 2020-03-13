import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { AreNotificationsPausedErrors } from './areNotificationsPausedErrors';

export type AreNotificationsPausedResponse = Either<
  | AreNotificationsPausedErrors.InvalidNotificationType
  | AreNotificationsPausedErrors.InvoiceIdRequired
  | AreNotificationsPausedErrors.NotificationTypeRequired
  | AppError.UnexpectedError,
  Result<boolean>
>;
