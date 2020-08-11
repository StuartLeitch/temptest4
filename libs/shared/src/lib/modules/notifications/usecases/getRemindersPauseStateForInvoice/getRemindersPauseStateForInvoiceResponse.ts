import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { NotificationPause } from '../../domain/NotificationPause';

import * as GetRemindersPauseStateForInvoiceErrors from './getRemindersPauseStateForInvoiceErrors';

export type GetRemindersPauseStateForInvoiceResponse = Either<
  | GetRemindersPauseStateForInvoiceErrors.GetRemindersPauseDbError
  | GetRemindersPauseStateForInvoiceErrors.InvoiceIdRequiredError
  | GetRemindersPauseStateForInvoiceErrors.InvoiceNotFoundError
  | UnexpectedError,
  Result<NotificationPause>
>;
