import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './sendInvoicePaymentReminderErrors';

export type SendInvoicePaymentReminderResponse = Either<
  | Errors.RecipientEmailRequiredError
  | Errors.RecipientNameRequiredError
  | Errors.SenderEmailRequiredError
  | Errors.SenderNameRequiredError
  | Errors.NotificationDbSaveError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | Errors.RescheduleTaskFailed
  | Errors.EmailSendingFailure
  | Errors.ManuscriptNotFound
  | UnexpectedError,
  void
>;
