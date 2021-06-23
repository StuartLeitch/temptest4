import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`Invoice with id {${id}} not found.`);
  }
}

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class NoPaymentFoundError extends UseCaseError {
  constructor(id: string) {
    super(`No payment found for the invoice with id {${id}}.`);
  }
}

export class PaymentInfoDbError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While retrieving the payment info for invoice with id {${id}} an error ocurred {${err.message}}: ${err.stack}`
    );
  }
}
