import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace RecordPaymentErrors {
  export class InvalidPaymentAmount extends Result<UseCaseError> {
    constructor(amount: number) {
      super(false, {
        message: `The payment amount {${amount}} is invalid.`
      });
    }
  }
}
