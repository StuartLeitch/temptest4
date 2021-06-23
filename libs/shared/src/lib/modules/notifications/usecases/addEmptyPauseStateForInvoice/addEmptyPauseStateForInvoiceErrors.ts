import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceIdRequiredError extends UseCaseError {
  constructor() {
    super(`The invoice id is required.`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(id: string) {
    super(`The invoice with id {${id}} was not found.`);
  }
}

export class AddPauseDbError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While adding a pause state for invoice with id {${id}} an error ocurred: ${err.message}`
    );
  }
}
