import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace ScheduleRemindersForExistingInvoicesErrors {
  export class PauseDbError extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `While pausing event an error ocurred: ${err.message}`
      });
    }
  }
}
