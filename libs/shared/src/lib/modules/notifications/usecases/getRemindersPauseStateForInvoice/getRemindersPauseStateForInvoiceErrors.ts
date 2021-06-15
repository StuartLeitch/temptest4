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

export class GetRemindersPauseDbError extends UseCaseError {
  constructor(err: Error) {
    super(`While getting the pause state an error ocurred: ${err.message}`);
  }
}
