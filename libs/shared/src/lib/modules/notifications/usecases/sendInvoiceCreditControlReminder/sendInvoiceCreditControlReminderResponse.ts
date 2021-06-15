import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './sendInvoiceCreditControlReminderErrors';

export type SendInvoiceCreditControlReminderResponse = Either<
  | Errors.NotificationDisabledSettingRequiredError
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
