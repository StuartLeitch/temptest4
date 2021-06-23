import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { NotificationPause } from '../../domain/NotificationPause';

import * as Errors from './getRemindersPauseStateForInvoiceErrors';

export type GetRemindersPauseStateForInvoiceResponse = Either<
  | Errors.GetRemindersPauseDbError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | UnexpectedError,
  NotificationPause
>;
