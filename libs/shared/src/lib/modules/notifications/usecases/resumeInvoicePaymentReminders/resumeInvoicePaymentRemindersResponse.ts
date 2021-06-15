import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './resumeInvoicePaymentRemindersErrors';

export type ResumeInvoicePaymentRemindersResponse = Either<
  | Errors.CouldNotGetTransactionForInvoiceError
  | Errors.PaymentRemindersNotPausedError
  | Errors.ReminderDelayRequiredError
  | Errors.ReminderResumeSaveDbError
  | Errors.InvoiceIdRequiredError
  | Errors.QueueNameRequiredError
  | Errors.InvoiceNotFoundError
  | Errors.ScheduleTaskFailed
  | UnexpectedError,
  void
>;
