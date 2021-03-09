import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`The invoice id is required.`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`Invoice with id {${id}} not found.`);
  }
}

export class RetrievingPaymentsDbError extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(
      `While retrieving the payments for invoice with id {${invoiceId}}, an error ocurred ${err.message}: ${err.stack}`
    );
  }
}
