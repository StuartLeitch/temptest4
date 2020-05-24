import { UseCaseError } from '../../../../../core/logic/UseCaseError';
import { Result } from '../../../../../core/logic/Result';

export class PaymentMethodsRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Payment methods are required.`,
    });
  }
}

export class PaymentsRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Payments are required.`,
    });
  }
}

export class BillingAddressRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Billing address is required.`,
    });
  }
}

export class ManuscriptRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Manuscript is required.`,
    });
  }
}

export class InvoiceItemsRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Invoice items are required.`,
    });
  }
}

export class CreditNoteRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Credit note is required.`,
    });
  }
}

export class PayerRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `Payer is required.`,
    });
  }
}
