import { PaymentModel } from '../contracts/PaymentModel';

export class Braintree implements PaymentModel {
  BRAINTREE_PAYMENT = Symbol.for('@BraintreePayment');

  public PaymentMethodNonce: string;

  get paymentMethodNonce(): string {
    return this.PaymentMethodNonce;
  }

  set paymentMethodNonce(value: string) {
    this.PaymentMethodNonce = value;
  }

  public getType(): symbol {
    return this.BRAINTREE_PAYMENT;
  }
}
