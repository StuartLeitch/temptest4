import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class InvoiceIdRequiredError extends Result<UseCaseError> {
  constructor() {
    super(false, {
      message: `The invoice id is required.`,
    });
  }
}

export class InvoiceNotFoundError extends Result<UseCaseError> {
  constructor(id: string) {
    super(false, {
      message: `The invoice with id {${id}} was not found.`,
    });
  }
}

export class GetRemindersPauseDbError extends Result<UseCaseError> {
  constructor(err: Error) {
    super(false, {
      message: `While getting the pause state an error ocurred: ${err.message}`,
    });
  }
}
