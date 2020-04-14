import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Notification } from '../../domain/Notification';

import * as GetSentNotificationForInvoiceErrors from './getSentNotificationForInvoiceErrors';

export type GetSentNotificationForInvoiceResponse = Either<
  | GetSentNotificationForInvoiceErrors.InvoiceNotFoundError
  | GetSentNotificationForInvoiceErrors.EncounteredDbError
  | GetSentNotificationForInvoiceErrors.InvoiceIdRequired
  | AppError.UnexpectedError,
  Result<Notification[]>
>;
