import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace UpdateInvoiceItemsErrors {
  export class InvoiceItemNotFound extends Result<UseCaseError> {
    constructor(invoiceItemId: string) {
      super(false, {
        message: `The Invoice Item with Invoice Item id {${invoiceItemId}} could not be found.`
      });
    }
  }
}
