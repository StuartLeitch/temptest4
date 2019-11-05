import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace CreatePaymentErrors {
  export class PaymentCreatedError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Can't create a new Payment.`
      } as UseCaseError);
    }
  }
}
