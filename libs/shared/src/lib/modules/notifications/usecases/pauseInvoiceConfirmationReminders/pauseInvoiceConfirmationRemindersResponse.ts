import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { PauseInvoiceConfirmationRemindersErrors } from './pauseInvoiceConfirmationRemindersErrors';

export type PauseInvoiceConfirmationRemindersResponse = Either<
  | PauseInvoiceConfirmationRemindersErrors.InvoiceIdRequiredError
  | PauseInvoiceConfirmationRemindersErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
