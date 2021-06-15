import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './scheduleRemindersForExistingInvoicesErrors';

export type ScheduleRemindersForExistingInvoicesResponse = Either<
  | Errors.CreditControlDisabledSettingRequiredError
  | Errors.GetInvoiceIdsWithoutPauseSettingsDbError
  | Errors.CouldNotGetTransactionForInvoiceError
  | Errors.ConfirmationQueueNameRequiredError
  | Errors.ScheduleCreditControlReminderError
  | Errors.ConfirmationDelayRequiredError
  | Errors.PaymentQueueNameRequiredError
  | Errors.CreditControlDelayIsRequired
  | Errors.PaymentDelayRequiredError
  | Errors.PauseDbError
  | UnexpectedError,
  void
>;
