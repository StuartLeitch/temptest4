import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { SendInvoiceConfirmationReminderErrors } from './sendInvoiceConfirmationReminderErrors';

export type SendInvoiceConfirmationReminderResponse = Either<
  | SendInvoiceConfirmationReminderErrors.ManuscriptCustomIdRequiredError
  | SendInvoiceConfirmationReminderErrors.RecipientEmailRequiredError
  | SendInvoiceConfirmationReminderErrors.RecipientNameRequiredError
  | SendInvoiceConfirmationReminderErrors.SenderEmailRequiredError
  | SendInvoiceConfirmationReminderErrors.SenderNameRequiredError
  | SendInvoiceConfirmationReminderErrors.InvoiceIdRequiredError
  | SendInvoiceConfirmationReminderErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
