import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './resumeInvoiceConfirmationRemindersErrors';

export type ResumeInvoiceConfirmationRemindersResponse = Either<
  | Errors.CouldNotGetTransactionForInvoiceError
  | Errors.ConfirmationRemindersNotPausedError
  | Errors.ReminderDelayRequiredError
  | Errors.ReminderResumeSaveDbError
  | Errors.InvoiceIdRequiredError
  | Errors.QueueNameRequiredError
  | Errors.InvoiceNotFoundError
  | Errors.ScheduleTaskFailed
  | UnexpectedError,
  void
>;
