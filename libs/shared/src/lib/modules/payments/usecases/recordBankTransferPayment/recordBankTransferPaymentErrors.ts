import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace RecordBankTransferPaymentErrors {
  export class PaymentError extends Result<UseCaseError> {
    constructor(message: string) {
      super(false, {
        message: `There was an error when making the payment: ${message}`
      });
    }
  }
}
