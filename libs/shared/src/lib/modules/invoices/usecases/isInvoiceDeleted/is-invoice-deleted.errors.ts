import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`Invoice id is required for UseCase {IsInvoiceDeleted}`);
  }
}

export class InvoiceCheckDbError extends UseCaseError {
  constructor(err: Error) {
    super(
      `While checking the delete status for invoice an error ocurred: ${err.message}, with stack ${err.stack}`
    );
  }
}
