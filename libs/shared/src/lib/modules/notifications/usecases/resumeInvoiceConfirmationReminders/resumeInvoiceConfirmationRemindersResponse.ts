import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { ResumeInvoiceConfirmationRemindersErrors } from './resumeInvoiceConfirmationRemindersErrors';

export type ResumeInvoiceConfirmationRemindersResponse = Either<
  | ResumeInvoiceConfirmationRemindersErrors.CouldNotGetTransactionForInvoiceError
  | ResumeInvoiceConfirmationRemindersErrors.ConfirmationRemindersNotPausedError
  | ResumeInvoiceConfirmationRemindersErrors.ReminderDelayRequiredError
  | ResumeInvoiceConfirmationRemindersErrors.ReminderResumeSaveDbError
  | ResumeInvoiceConfirmationRemindersErrors.InvoiceIdRequiredError
  | ResumeInvoiceConfirmationRemindersErrors.QueueNameRequiredError
  | ResumeInvoiceConfirmationRemindersErrors.InvoiceNotFoundError
  | ResumeInvoiceConfirmationRemindersErrors.ScheduleTaskFailed
  | AppError.UnexpectedError,
  Result<void>
>;
