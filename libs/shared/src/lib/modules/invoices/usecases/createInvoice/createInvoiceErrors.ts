import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace CreateInvoiceErrors {
  export class TransactionNotFoundError extends Result<UseCaseError> {
    constructor(transactionId: string) {
      super(false, {
        message: `Couldn't find a Transaction for {${transactionId}}.`
      } as UseCaseError);
    }
  }
}
