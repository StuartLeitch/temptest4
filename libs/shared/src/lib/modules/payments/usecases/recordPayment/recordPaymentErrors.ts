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
