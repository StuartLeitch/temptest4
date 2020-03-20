import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace ResumeConfirmationRemindersErrors {
  export class InvoiceIdRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `The invoice id is required.`
      });
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `The invoice with id {${invoiceId}} was not found`
      });
    }
  }

  export class ConfirmationRemindersNotPausedError extends Result<
    UseCaseError
  > {
    constructor(invoiceId: string) {
      super(false, {
        message: `The confirmation reminders for invoice with id {${invoiceId}} wore not paused.`
      });
    }
  }
}
