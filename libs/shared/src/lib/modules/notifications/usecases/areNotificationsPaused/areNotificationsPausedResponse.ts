import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { AreNotificationsPausedErrors } from './areNotificationsPausedErrors';

export type AreNotificationsPausedResponse = Either<
  | AreNotificationsPausedErrors.NotificationTypeRequired
  | AreNotificationsPausedErrors.InvalidNotificationType
  | AreNotificationsPausedErrors.EncounteredDbError
  | AreNotificationsPausedErrors.InvoiceIdRequired
  | AppError.UnexpectedError,
  Result<boolean>
>;
