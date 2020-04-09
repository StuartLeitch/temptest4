import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace PauseInvoiceConfirmationRemindersErrors {
  export class InvoiceIdRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `The invoice id is required.`
      });
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `The invoice with id {${id}} was not found.`
      });
    }
  }

  export class SetReminderPauseDbError extends Result<UseCaseError> {
    constructor(e: Error) {
      super(false, {
        message: `While saving the pause state an error ocurred: ${e.message}`
      });
    }
  }
}
