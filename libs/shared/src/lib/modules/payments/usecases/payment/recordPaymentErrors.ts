import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace RecordPaymentErrors {
  export class PayerNotFoundError extends Result<UseCaseError> {
    constructor(payerId: string) {
      super(false, {
        message: `Couldn't find Payer for id = {${payerId}}.`
      } as UseCaseError);
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find Invoice with id = {${invoiceId}}.`
      } as UseCaseError);
    }
  }
}
