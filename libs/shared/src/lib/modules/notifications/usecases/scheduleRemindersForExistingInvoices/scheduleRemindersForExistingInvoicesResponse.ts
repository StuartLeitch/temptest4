import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { ScheduleRemindersForExistingInvoicesErrors } from './scheduleRemindersForExistingInvoicesErrors';

export type ScheduleRemindersForExistingInvoicesResponse = Either<
  | ScheduleRemindersForExistingInvoicesErrors.PauseDbError
  | AppError.UnexpectedError,
  Result<void>
>;
