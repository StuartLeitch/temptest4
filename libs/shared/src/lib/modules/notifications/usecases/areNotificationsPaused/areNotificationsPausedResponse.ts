import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './areNotificationsPausedErrors';

export type AreNotificationsPausedResponse = Either<
  | Errors.NotificationTypeRequired
  | Errors.InvalidNotificationType
  | Errors.EncounteredDbError
  | Errors.InvoiceIdRequired
  | UnexpectedError,
  boolean
>;
