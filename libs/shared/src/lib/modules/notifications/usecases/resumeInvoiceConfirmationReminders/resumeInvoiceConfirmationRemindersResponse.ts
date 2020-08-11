import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as ResumeInvoiceConfirmationRemindersErrors from './resumeInvoiceConfirmationRemindersErrors';

export type ResumeInvoiceConfirmationRemindersResponse = Either<
  | ResumeInvoiceConfirmationRemindersErrors.CouldNotGetTransactionForInvoiceError
  | ResumeInvoiceConfirmationRemindersErrors.ConfirmationRemindersNotPausedError
  | ResumeInvoiceConfirmationRemindersErrors.ReminderDelayRequiredError
  | ResumeInvoiceConfirmationRemindersErrors.ReminderResumeSaveDbError
  | ResumeInvoiceConfirmationRemindersErrors.InvoiceIdRequiredError
  | ResumeInvoiceConfirmationRemindersErrors.QueueNameRequiredError
  | ResumeInvoiceConfirmationRemindersErrors.InvoiceNotFoundError
  | ResumeInvoiceConfirmationRemindersErrors.ScheduleTaskFailed
  | UnexpectedError,
  Result<void>
>;
