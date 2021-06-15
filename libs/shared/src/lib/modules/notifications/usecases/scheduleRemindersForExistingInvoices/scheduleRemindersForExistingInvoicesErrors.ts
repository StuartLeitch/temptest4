import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PauseDbError extends UseCaseError {
  constructor(err: Error) {
    super(`While pausing event an error ocurred: ${err.message}`);
  }
}

export class GetInvoiceIdsWithoutPauseSettingsDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While determining the invoice ids for scheduling an error ocurred: ${err.message}`
    );
  }
}

export class ConfirmationQueueNameRequiredError extends UseCaseError {
  constructor() {
    super(`The confirmation queue name is required`);
  }
}

export class ConfirmationDelayRequiredError extends UseCaseError {
  constructor() {
    super(`The confirmation delay is required`);
  }
}

export class PaymentQueueNameRequiredError extends UseCaseError {
  constructor() {
    super(`The payment queue name is required`);
  }
}

export class PaymentDelayRequiredError extends UseCaseError {
  constructor() {
    super(`The payment delay is required`);
  }
}

export class CreditControlDelayIsRequired extends UseCaseError {
  constructor() {
    super(`The credit control delay is required`);
  }
}

export class CreditControlDisabledSettingRequiredError extends UseCaseError {
  constructor() {
    super(`The credit control disabled setting is required`);
  }
}

export class ScheduleCreditControlReminderError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While scheduling the credit control reminder an error ocurred: ${err.message}`
    );
  }
}

export class PausingConfirmationReminderError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While pausing confirmation reminders for invoice {${id}} got error ${err.message}`
    );
  }
}

export class ResumingConfirmationReminderError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While resuming confirmation reminders for invoice {${id}} got error ${err.message}`
    );
  }
}

export class PausingPaymentReminderError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While pausing payment reminders for invoice {${id}} got error ${err.message}`
    );
  }
}

export class ResumingPaymentReminderError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While resuming payment reminders for invoice {${id}} got error ${err.message}`
    );
  }
}

export class ResumingCreditControlReminderError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While resuming credit control reminders for invoice {${id}} got error ${err.message}`
    );
  }
}

export class CouldNotGetTransactionForInvoiceError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `While getting the transaction for invoice with id {${invoiceId}} an error ocurred: ${err.message}`
    );
  }
}
