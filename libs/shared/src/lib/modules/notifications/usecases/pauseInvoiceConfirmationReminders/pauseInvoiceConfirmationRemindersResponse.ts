import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import * as PauseInvoiceConfirmationRemindersErrors from './pauseInvoiceConfirmationRemindersErrors';

export type PauseInvoiceConfirmationRemindersResponse = Either<
  | PauseInvoiceConfirmationRemindersErrors.InvoiceIdRequiredError
  | PauseInvoiceConfirmationRemindersErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
