import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace RecordPayPalPaymentErrors {
  export class InvalidPayment extends Result<UseCaseError> {
    constructor(id: string) {
      super(false, {
        message: `The Payment with id {${id}} is invalid.`
      });
    }
  }

  export class PaymentNotFond extends Result<UseCaseError> {
    constructor(orderId: string) {
      super(false, {
        message: `The Payment with id {${orderId}} was not found in PayPal.`
      });
    }
  }
}
