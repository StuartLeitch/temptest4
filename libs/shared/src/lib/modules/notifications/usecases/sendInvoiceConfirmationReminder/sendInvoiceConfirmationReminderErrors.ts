import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`No invoice with id {${id}} exists.`);
  }
}
export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class RecipientEmailRequiredError extends UseCaseError {
  constructor() {
    super(`Recipient email is required.`);
  }
}

export class RecipientNameRequiredError extends UseCaseError {
  constructor() {
    super(`Recipient name is required.`);
  }
}

export class SenderEmailRequiredError extends UseCaseError {
  constructor() {
    super(`Sender Email is required.`);
  }
}

export class SenderNameRequiredError extends UseCaseError {
  constructor() {
    super(`Sender name is required.`);
  }
}

export class EmailSendingFailure extends UseCaseError {
  constructor(err: Error) {
    super(`Email sending has failed with error {${err}}`);
  }
}

export class NotificationDbSaveError extends UseCaseError {
  constructor(err: Error) {
    super(`Failed to save the notification send in the DB with error {${err}}`);
  }
}

export class RescheduleTaskFailed extends UseCaseError {
  constructor(err: Error) {
    super(`Failed to reschedule the notification task with error {${err}}`);
  }
}

export class CouldNotGetTransactionForInvoiceError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `While getting the transaction for invoice with id {${invoiceId}} an error ocurred: ${err.message}`
    );
  }
}
