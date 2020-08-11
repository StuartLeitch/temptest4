import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as ResumeInvoicePaymentRemindersErrors from './resumeInvoicePaymentRemindersErrors';

export type ResumeInvoicePaymentRemindersResponse = Either<
  | ResumeInvoicePaymentRemindersErrors.CouldNotGetTransactionForInvoiceError
  | ResumeInvoicePaymentRemindersErrors.PaymentRemindersNotPausedError
  | ResumeInvoicePaymentRemindersErrors.ReminderDelayRequiredError
  | ResumeInvoicePaymentRemindersErrors.ReminderResumeSaveDbError
  | ResumeInvoicePaymentRemindersErrors.InvoiceIdRequiredError
  | ResumeInvoicePaymentRemindersErrors.QueueNameRequiredError
  | ResumeInvoicePaymentRemindersErrors.InvoiceNotFoundError
  | ResumeInvoicePaymentRemindersErrors.ScheduleTaskFailed
  | UnexpectedError,
  Result<void>
>;
