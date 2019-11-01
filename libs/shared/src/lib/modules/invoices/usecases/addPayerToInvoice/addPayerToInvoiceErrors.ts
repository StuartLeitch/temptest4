import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace AddPayerToInvoiceErrors {
  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find an Invoice for {${invoiceId}}.`
      } as UseCaseError);
    }
  }
}
