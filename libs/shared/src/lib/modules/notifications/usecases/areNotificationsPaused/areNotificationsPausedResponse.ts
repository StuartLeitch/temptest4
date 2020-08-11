import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as AreNotificationsPausedErrors from './areNotificationsPausedErrors';

export type AreNotificationsPausedResponse = Either<
  | AreNotificationsPausedErrors.NotificationTypeRequired
  | AreNotificationsPausedErrors.InvalidNotificationType
  | AreNotificationsPausedErrors.EncounteredDbError
  | AreNotificationsPausedErrors.InvoiceIdRequired
  | UnexpectedError,
  Result<boolean>
>;
