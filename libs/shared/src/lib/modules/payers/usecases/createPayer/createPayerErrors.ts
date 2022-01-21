import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PayerNotFoundError extends UseCaseError {
  constructor(payerId: string) {
    super(`Couldn't find the payer with id {${payerId}}.`);
  }
}

export class NotAbleToCreatePayerError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't create a payer for invoice with id {${invoiceId}}.`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find an Invoice for {${invoiceId}}.`);
  }
}
