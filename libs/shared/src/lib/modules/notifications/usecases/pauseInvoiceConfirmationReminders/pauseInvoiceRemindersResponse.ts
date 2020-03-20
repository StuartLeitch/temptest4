import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { PauseInvoiceRemindersErrors } from './pauseInvoiceRemindersErrors';

export type PauseInvoiceRemindersResponse = Either<
  | PauseInvoiceRemindersErrors.InvoiceIdRequiredError
  | PauseInvoiceRemindersErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
