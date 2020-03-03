import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { SendInvoiceConfirmationReminderErrors } from './sendInvoiceConfirmationReminderErrors';

export type SendInvoiceConfirmationReminderResponse = Either<
  | SendInvoiceConfirmationReminderErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
