import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { SendInvoiceCreditControlReminderErrors } from './sendInvoiceCreditControlReminderErrors';

export type SendInvoiceCreditControlReminderResponse = Either<
  | SendInvoiceCreditControlReminderErrors.ManuscriptCustomIdRequiredError
  | SendInvoiceCreditControlReminderErrors.RecipientEmailRequiredError
  | SendInvoiceCreditControlReminderErrors.RecipientNameRequiredError
  | SendInvoiceCreditControlReminderErrors.SenderEmailRequiredError
  | SendInvoiceCreditControlReminderErrors.NotificationDbSaveError
  | SendInvoiceCreditControlReminderErrors.SenderNameRequiredError
  | SendInvoiceCreditControlReminderErrors.InvoiceIdRequiredError
  | SendInvoiceCreditControlReminderErrors.InvoiceNotFoundError
  | SendInvoiceCreditControlReminderErrors.RescheduleTaskFailed
  | SendInvoiceCreditControlReminderErrors.EmailSendingFailure
  | AppError.UnexpectedError,
  Result<void>
>;
