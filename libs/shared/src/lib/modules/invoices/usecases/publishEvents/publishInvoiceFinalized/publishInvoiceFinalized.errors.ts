import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class PaymentMethodsRequiredError extends UseCaseError {
  constructor() {
    super(`Payment methods are required.`);
  }
}

export class PaymentsRequiredError extends UseCaseError {
  constructor() {
    super(`Payments are required.`);
  }
}

export class BillingAddressRequiredError extends UseCaseError {
  constructor() {
    super(`Billing address is required.`);
  }
}

export class ManuscriptRequiredError extends UseCaseError {
  constructor() {
    super(`Manuscript is required.`);
  }
}

export class InvoiceItemsRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice items are required.`);
  }
}

export class InvoiceRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice is required.`);
  }
}

export class PayerRequiredError extends UseCaseError {
  constructor() {
    super(`Payer is required.`);
  }
}
