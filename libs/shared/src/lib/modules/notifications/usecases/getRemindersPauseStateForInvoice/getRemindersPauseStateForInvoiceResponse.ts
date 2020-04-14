import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { NotificationPause } from '../../domain/NotificationPause';

import * as GetRemindersPauseStateForInvoiceErrors from './getRemindersPauseStateForInvoiceErrors';

export type GetRemindersPauseStateForInvoiceResponse = Either<
  | GetRemindersPauseStateForInvoiceErrors.GetRemindersPauseDbError
  | GetRemindersPauseStateForInvoiceErrors.InvoiceIdRequiredError
  | GetRemindersPauseStateForInvoiceErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<NotificationPause>
>;
