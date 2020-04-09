import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetSentNotificationForInvoiceErrors {
  export class InvoiceIdRequired extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Invoice id is required.`
      });
    }
  }

  export class EncounteredDbError extends Result<UseCaseError> {
    constructor(id: string, e: Error) {
      super(false, {
        message: ` When accessing notifications by invoice id {${id}} an error was encountered: ${e.message}`
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
}
