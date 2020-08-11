import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as PauseInvoicePaymentRemindersErrors from './pauseInvoicePaymentRemindersErrors';

export type PauseInvoicePaymentRemindersResponse = Either<
  | PauseInvoicePaymentRemindersErrors.SetReminderPauseDbError
  | PauseInvoicePaymentRemindersErrors.InvoiceIdRequiredError
  | PauseInvoicePaymentRemindersErrors.InvoiceNotFoundError
  | UnexpectedError,
  Result<void>
>;
