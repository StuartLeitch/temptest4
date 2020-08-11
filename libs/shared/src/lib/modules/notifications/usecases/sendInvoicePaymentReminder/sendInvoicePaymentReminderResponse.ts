import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as SendInvoicePaymentReminderErrors from './sendInvoicePaymentReminderErrors';

export type SendInvoicePaymentReminderResponse = Either<
  | SendInvoicePaymentReminderErrors.RecipientEmailRequiredError
  | SendInvoicePaymentReminderErrors.RecipientNameRequiredError
  | SendInvoicePaymentReminderErrors.SenderEmailRequiredError
  | SendInvoicePaymentReminderErrors.SenderNameRequiredError
  | SendInvoicePaymentReminderErrors.NotificationDbSaveError
  | SendInvoicePaymentReminderErrors.InvoiceIdRequiredError
  | SendInvoicePaymentReminderErrors.InvoiceNotFoundError
  | SendInvoicePaymentReminderErrors.RescheduleTaskFailed
  | SendInvoicePaymentReminderErrors.EmailSendingFailure
  | SendInvoicePaymentReminderErrors.ManuscriptNotFound
  | UnexpectedError,
  Result<void>
>;
