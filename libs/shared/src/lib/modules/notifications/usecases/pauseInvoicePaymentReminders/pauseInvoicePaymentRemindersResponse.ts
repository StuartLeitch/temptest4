import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './pauseInvoicePaymentRemindersErrors';

export type PauseInvoicePaymentRemindersResponse = Either<
  | Errors.SetReminderPauseDbError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | UnexpectedError,
  void
>;
