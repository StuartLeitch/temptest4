import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace SendInvoiceConfirmationReminderErrors {
  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `No invoice with id {${id}} exists.`
      });
    }
  }
  export class InvoiceIdRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Invoice id is required.`
      });
    }
  }

  export class RecipientEmailRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Recipient email is required.`
      });
    }
  }

  export class RecipientNameRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Recipient name is required.`
      });
    }
  }

  export class SenderEmailRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Sender Email is required.`
      });
    }
  }

  export class SenderNameRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Sender name is required.`
      });
    }
  }

  export class ManuscriptCustomIdRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Manuscript custom id is required.`
      });
    }
  }

  export class EmailSendingFailure extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `Email sending has failed with error {${err}}`
      });
    }
  }

  export class NotificationDbSaveError extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `Failed to save the notification send in the DB with error {${err}}`
      });
    }
  }

  export class RescheduleTaskFailed extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `Failed to reschedule the notification task with error {${err}}`
      });
    }
  }

  export class CouldNotGetTransactionForInvoiceError extends Result<
    UseCaseError
  > {
    constructor(invoiceId: string, err: Error) {
      super(false, {
        message: `While getting the transaction for invoice with id {${invoiceId}} an error ocurred: ${err.message}`
      });
    }
  }
}
