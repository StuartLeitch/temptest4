import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace AddEmptyPauseStateForInvoiceErrors {
  export class InvoiceIdRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `The invoice id is required.`
      });
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `The invoice with id {${id}} was not found.`
      });
    }
  }

  export class AddPauseDbError extends Result<UseCaseError> {
    constructor(id: string, err: Error) {
      super(false, {
        message: `While adding a pause state for invoice with id {${id}} an error ocurred: ${err.message}`
      });
    }
  }
}
