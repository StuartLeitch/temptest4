import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace MigratePaymentErrors {
  export class InvalidPayment extends Result<UseCaseError> {
    constructor(paymentId: string) {
      super(false, {
        message: `The Payment with id {${paymentId}} is invalid.`
      });
    }
  }

  export class PaymentNotFound extends Result<UseCaseError> {
    constructor(paymentId: string) {
      super(false, {
        message: `The Payment with id {${paymentId}} was not found.`
      });
    }
  }
}
