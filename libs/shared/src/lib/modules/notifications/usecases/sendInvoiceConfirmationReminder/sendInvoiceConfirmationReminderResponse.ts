import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './sendInvoiceConfirmationReminderErrors';

export type SendInvoiceConfirmationReminderResponse = Either<
  | Errors.CouldNotGetTransactionForInvoiceError
  | Errors.RecipientEmailRequiredError
  | Errors.RecipientNameRequiredError
  | Errors.SenderEmailRequiredError
  | Errors.NotificationDbSaveError
  | Errors.SenderNameRequiredError
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | Errors.RescheduleTaskFailed
  | Errors.EmailSendingFailure
  | UnexpectedError,
  void
>;
