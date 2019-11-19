import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace RecordPayPalPaymentErrors {
  export class InvalidPayment extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `The payment with id {${id}} is invalid.`
      });
    }
  }
}
