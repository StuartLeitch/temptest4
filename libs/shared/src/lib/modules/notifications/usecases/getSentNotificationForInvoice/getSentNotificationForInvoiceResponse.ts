import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Notification } from '../../domain/Notification';

import * as Errors from './getSentNotificationForInvoiceErrors';

export type GetSentNotificationForInvoiceResponse = Either<
  | Errors.InvoiceNotFoundError
  | Errors.EncounteredDbError
  | Errors.InvoiceIdRequired
  | UnexpectedError,
  Notification[]
>;
