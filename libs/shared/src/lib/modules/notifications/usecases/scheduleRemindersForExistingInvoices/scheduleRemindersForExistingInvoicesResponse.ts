import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { ScheduleRemindersForExistingInvoicesErrors } from './scheduleRemindersForExistingInvoicesErrors';

export type ScheduleRemindersForExistingInvoicesResponse = Either<
  | ScheduleRemindersForExistingInvoicesErrors.GetInvoiceIdsWithoutPauseSettingsDbError
  | ScheduleRemindersForExistingInvoicesErrors.ConfirmationQueueNameRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.ScheduleCreditControlReminderError
  | ScheduleRemindersForExistingInvoicesErrors.ConfirmationDelayRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.PaymentQueueNameRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.CreditControlDelayIsRequired
  | ScheduleRemindersForExistingInvoicesErrors.PaymentDelayRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.PauseDbError
  | AppError.UnexpectedError,
  Result<void>
>;
