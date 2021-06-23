import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`The invoice id is required.`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`The invoice with id {${invoiceId}} was not found`);
  }
}

export class PaymentRemindersNotPausedError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `The payment reminders for invoice with id {${invoiceId}} wore not paused.`
    );
  }
}

export class QueueNameRequiredError extends UseCaseError {
  constructor() {
    super(`The queue name for the reminder jobs is required.`);
  }
}

export class ReminderDelayRequiredError extends UseCaseError {
  constructor() {
    super(`The reminder delay is required.`);
  }
}

export class ReminderResumeSaveDbError extends UseCaseError {
  constructor(e: Error) {
    super(`While updating the paused status a db error ocurred: ${e.message}`);
  }
}

export class ScheduleTaskFailed extends UseCaseError {
  constructor(err: Error) {
    super(`Failed to schedule the notification task with error {${err}}`);
  }
}

export class CouldNotGetTransactionForInvoiceError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `While getting the transaction for invoice with id {${invoiceId}} an error ocurred: ${err.message}`
    );
  }
}
