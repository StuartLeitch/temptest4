import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as PauseInvoiceConfirmationRemindersErrors from './pauseInvoiceConfirmationRemindersErrors';

export type PauseInvoiceConfirmationRemindersResponse = Either<
  | PauseInvoiceConfirmationRemindersErrors.InvoiceIdRequiredError
  | PauseInvoiceConfirmationRemindersErrors.InvoiceNotFoundError
  | UnexpectedError,
  Result<void>
>;
