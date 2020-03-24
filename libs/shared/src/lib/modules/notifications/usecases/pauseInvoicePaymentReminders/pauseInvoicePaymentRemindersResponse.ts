import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { PauseInvoicePaymentRemindersErrors } from './pauseInvoicePaymentRemindersErrors';

export type PauseInvoicePaymentRemindersResponse = Either<
  | PauseInvoicePaymentRemindersErrors.SetReminderPauseDbError
  | PauseInvoicePaymentRemindersErrors.InvoiceIdRequiredError
  | PauseInvoicePaymentRemindersErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
