import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvoiceIdRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The invoice id is required.`,
    });
  }
}

export class InvoiceNotFoundError extends Result<UseCaseError> {
  constructor(invoiceId: string) {
    super(false, {
      message: `The invoice with id {${invoiceId}} was not found`,
    });
  }
}

export class PaymentRemindersNotPausedError extends Result<UseCaseError> {
  constructor(invoiceId: string) {
    super(false, {
      message: `The payment reminders for invoice with id {${invoiceId}} wore not paused.`,
    });
  }
}

export class QueueNameRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The queue name for the reminder jobs is required.`,
    });
  }
}

export class ReminderDelayRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The reminder delay is required.`,
    });
  }
}

export class ReminderResumeSaveDbError extends Result<UseCaseError> {
  constructor(e: Error) {
    super(false, {
      message: `While updating the paused status a db error ocurred: ${e.message}`,
    });
  }
}

export class ScheduleTaskFailed extends Result<UseCaseError> {
  constructor(err: Error) {
    super(false, {
      message: `Failed to schedule the notification task with error {${err}}`,
    });
  }
}
