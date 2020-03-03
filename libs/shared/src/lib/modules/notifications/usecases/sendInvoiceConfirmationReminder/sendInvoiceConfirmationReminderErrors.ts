import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace SendInvoiceConfirmationReminderErrors {
  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `No invoice with id {${id}} exists.`
      });
    }
  }
}
