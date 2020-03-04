import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { SendInvoiceConfirmationReminderErrors } from './sendInvoiceConfirmationReminderErrors';

export type SendInvoiceConfirmationReminderResponse = Either<
  | SendInvoiceConfirmationReminderErrors.ManuscriptCustomIdRequiredError
  | SendInvoiceConfirmationReminderErrors.RecipientEmailRequiredError
  | SendInvoiceConfirmationReminderErrors.RecipientNameRequiredError
  | SendInvoiceConfirmationReminderErrors.SenderEmailRequiredError
  | SendInvoiceConfirmationReminderErrors.NotificationDbSaveError
  | SendInvoiceConfirmationReminderErrors.SenderNameRequiredError
  | SendInvoiceConfirmationReminderErrors.InvoiceIdRequiredError
  | SendInvoiceConfirmationReminderErrors.InvoiceNotFoundError
  | SendInvoiceConfirmationReminderErrors.RescheduleTaskFailed
  | SendInvoiceConfirmationReminderErrors.EmailSendingFailure
  | AppError.UnexpectedError,
  Result<void>
>;
