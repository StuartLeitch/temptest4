import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPaymentMethodByIdErrors {
  export class NoPaymentMethodFound extends Result<UseCaseError> {
    constructor(paymentMethodId: string) {
      super(false, {
        message: `No payment method with id {${paymentMethodId}} found.`
      });
    }
  }
}
