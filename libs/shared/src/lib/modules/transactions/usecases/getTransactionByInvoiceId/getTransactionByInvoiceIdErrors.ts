import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required`);
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`No transaction found with id {${id}}`);
  }
}
