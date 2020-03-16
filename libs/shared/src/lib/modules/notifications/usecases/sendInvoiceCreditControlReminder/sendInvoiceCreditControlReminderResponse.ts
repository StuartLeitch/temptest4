import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { SendInvoiceCreditControlReminderErrors } from './sendInvoiceCreditControlReminderErrors';

export type SendInvoiceCreditControlReminderResponse = Either<
  | SendInvoiceCreditControlReminderErrors.EmailSendingFailure
  | SendInvoiceCreditControlReminderErrors.InvoiceIdRequiredError
  | SendInvoiceCreditControlReminderErrors.InvoiceNotFoundError
  | SendInvoiceCreditControlReminderErrors.ManuscriptCustomIdRequiredError
  | SendInvoiceCreditControlReminderErrors.NotificationDbSaveError
  | SendInvoiceCreditControlReminderErrors.RecipientEmailRequiredError
  | SendInvoiceCreditControlReminderErrors.RecipientNameRequiredError
  | SendInvoiceCreditControlReminderErrors.RescheduleTaskFailed
  | SendInvoiceCreditControlReminderErrors.SenderEmailRequiredError
  | SendInvoiceCreditControlReminderErrors.SenderNameRequiredError
  | AppError.UnexpectedError,
  Result<void>
>;
