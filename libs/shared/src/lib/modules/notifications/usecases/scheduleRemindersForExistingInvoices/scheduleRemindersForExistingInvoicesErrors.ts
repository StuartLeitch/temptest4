import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class PauseDbError extends Result<UseCaseError> {
  constructor(err: Error) {
    super(false, {
      message: `While pausing event an error ocurred: ${err.message}`,
    });
  }
}

export class GetInvoiceIdsWithoutPauseSettingsDbError extends Result<
  UseCaseError
> {
  constructor(err: Error) {
    super(false, {
      message: `While determining the invoice ids for scheduling an error ocurred: ${err.message}`,
    });
  }
}

export class ConfirmationQueueNameRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The confirmation queue name is required`,
    });
  }
}

export class ConfirmationDelayRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The confirmation delay is required`,
    });
  }
}

export class PaymentQueueNameRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The payment queue name is required`,
    });
  }
}

export class PaymentDelayRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The payment delay is required`,
    });
  }
}

export class CreditControlDelayIsRequired extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The credit control delay is required`,
    });
  }
}

export class ScheduleCreditControlReminderError extends Result<UseCaseError> {
  constructor(err: Error) {
    super(false, {
      message: `While scheduling the credit control reminder an error ocurred: ${err.message}`,
    });
  }
}

export class PausingConfirmationReminderError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `While pausing confirmation reminders for invoice {${id}} got error ${err.message}`,
    });
  }
}

export class ResumingConfirmationReminderError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `While resuming confirmation reminders for invoice {${id}} got error ${err.message}`,
    });
  }
}

export class PausingPaymentReminderError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `While pausing payment reminders for invoice {${id}} got error ${err.message}`,
    });
  }
}

export class ResumingPaymentReminderError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `While resuming payment reminders for invoice {${id}} got error ${err.message}`,
    });
  }
}

export class ResumingCreditControlReminderError extends Result<UseCaseError> {
  constructor(id: string, err: Error) {
    super(false, {
      message: `While resuming credit control reminders for invoice {${id}} got error ${err.message}`,
    });
  }
}

export class CouldNotGetTransactionForInvoiceError extends Result<
  UseCaseError
> {
  constructor(invoiceId: string, err: Error) {
    super(false, {
      message: `While getting the transaction for invoice with id {${invoiceId}} an error ocurred: ${err.message}`,
    });
  }
}
