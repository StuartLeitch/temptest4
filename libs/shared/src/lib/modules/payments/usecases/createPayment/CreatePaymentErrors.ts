import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PayerIdRequiredError extends UseCaseError {
  constructor() {
    super(`Payer id is required`);
  }
}

export class ForeignPaymentIdRequiredError extends UseCaseError {
  constructor() {
    super(`Foreign payment id is required`);
  }
}

export class PaymentMethodIdRequiredError extends UseCaseError {
  constructor() {
    super(`Payment method id is required`);
  }
}

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required`);
  }
}

export class AmountRequiredError extends UseCaseError {
  constructor() {
    super(`Amount is required`);
  }
}

export class StatusRequiredError extends UseCaseError {
  constructor() {
    super(`Status is required`);
  }
}

export class IsFinalPaymentRequiredError extends UseCaseError {
  constructor() {
    super('Is Final Payment is required');
  }
}

export class StatusInvalidValueError extends UseCaseError {
  constructor(value: string) {
    super(
      `The provided value {${value}} for status is not assignable to type "PaymentStatus"`
    );
  }
}

export class PaymentCreationError extends UseCaseError {
  constructor(err: Error) {
    super(
      `When creating the payment an error ocurred {${err.message}}, with stack: ${err.stack}`
    );
  }
}

export class PaymentSavingDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While saving the payment in the DB an error ocurred {${err.message}}, with stack: ${err.stack}`
    );
  }
}
