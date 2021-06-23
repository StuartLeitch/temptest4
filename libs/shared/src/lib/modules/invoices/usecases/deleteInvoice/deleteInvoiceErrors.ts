import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super('The invoice id is required.');
  }
}

export class InvoiceNotExistsError extends UseCaseError {
  constructor(id: string) {
    super(`Invoice with id ${id} does not exists.`);
  }
}
