import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { ScheduleRemindersForExistingInvoicesErrors } from './scheduleRemindersForExistingInvoicesErrors';

export type ScheduleRemindersForExistingInvoicesResponse = Either<
  | ScheduleRemindersForExistingInvoicesErrors.GetInvoiceIdsWithoutPauseSettingsDbError
  | ScheduleRemindersForExistingInvoicesErrors.ConfirmationQueueNameRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.ConfirmationJobTypeRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.ConfirmationDelayRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.PaymentQueueNameRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.CreditControlDelayIsRequired
  | ScheduleRemindersForExistingInvoicesErrors.PaymentJobTypeRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.PaymentDelayRequiredError
  | ScheduleRemindersForExistingInvoicesErrors.PauseDbError
  | AppError.UnexpectedError,
  Result<void>
>;
