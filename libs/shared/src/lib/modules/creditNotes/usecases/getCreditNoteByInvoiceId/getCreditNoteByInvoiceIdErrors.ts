import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetCreditNoteByInvoiceIdErrors {
  export class CreditNoteNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find a Credit Note referencing invoice {${invoiceId}}.`
      } as UseCaseError);
    }
  }
}
