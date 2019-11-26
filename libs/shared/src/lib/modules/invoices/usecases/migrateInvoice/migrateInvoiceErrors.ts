import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace MigrateInvoiceErrors {
  export class InvoiceNotFound extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `The Invoice with id {${invoiceId}} was not found.`
      });
    }
  }
}
