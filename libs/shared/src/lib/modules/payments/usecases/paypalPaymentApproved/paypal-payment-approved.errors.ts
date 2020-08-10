import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required`);
  }
}

export class PayPalOrderIdRequiredError extends UseCaseError {
  constructor() {
    super(`PayPal order id is required`);
  }
}

export class SavingNewStatusForPaymentDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the new status for payment an error ocurred: ${err.message}, with stack: ${err.stack}`
    );
  }
}
