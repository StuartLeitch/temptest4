import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFountError extends UseCaseError {
  constructor(id: string) {
    super(
      `Invoice with id {${id}} was not found, while recording a payment for it`
    );
  }
}

export class InvoiceTotalLessThanZeroError extends UseCaseError {
  constructor(id: string, total: number) {
    super(`Invoice with id {${id}} has total {${total}} less than zero`);
  }
}

export class InvoiceAlreadyPaidError extends UseCaseError {
  constructor(refNumber: string) {
    super(`Invoice with reference number ${refNumber} has already been paid.`);
  }
}

export class InvoiceCannotBePaidError extends UseCaseError {
  constructor(id: string) {
    super(
      `Invoice with id {${id}} cannot be paid, because it is not confirmed.`
    );
  }
}

export class PaymentPendingError extends UseCaseError {
  constructor(id: string) {
    super(
      `Invoice with id {${id}} has a pending payment and cannot pe paid again.`
    );
  }
}

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class PaymentDateRequiredError extends UseCaseError {
  constructor() {
    super('payment date is required.');
  }
}

export class PaymentUpdateDbError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `While updating payment for invoice with id {${invoiceId}}, an error ocurred, with message: ${err.message} and stack ${err.stack}`
    );
  }
}
