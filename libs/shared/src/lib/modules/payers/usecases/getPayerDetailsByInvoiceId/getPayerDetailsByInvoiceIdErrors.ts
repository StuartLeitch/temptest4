import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class NoPayerFoundForInvoiceError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`No payer found for invoice with id {${invoiceId}}.`);
  }
}

export class FetchPayerFromDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While fetching the payer from the db an error ocurred: ${err.message}`
    );
  }
}
