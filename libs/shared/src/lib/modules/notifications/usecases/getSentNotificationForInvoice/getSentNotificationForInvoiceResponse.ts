import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Notification } from '../../domain/Notification';

import * as GetSentNotificationForInvoiceErrors from './getSentNotificationForInvoiceErrors';

export type GetSentNotificationForInvoiceResponse = Either<
  | GetSentNotificationForInvoiceErrors.InvoiceNotFoundError
  | GetSentNotificationForInvoiceErrors.EncounteredDbError
  | GetSentNotificationForInvoiceErrors.InvoiceIdRequired
  | UnexpectedError,
  Result<Notification[]>
>;
