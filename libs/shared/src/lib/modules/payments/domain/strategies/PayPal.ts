import {PaymentModel} from '../contracts/PaymentModel';

export class PayPal implements PaymentModel {
  PAYPAL_PAYMENT = Symbol.for('@PayPalPayment');

  public UserName: string;
  public Password: string;

  get userName(): string {
    return this.UserName;
  }

  get password(): string {
    return this.Password;
  }

  set userName(value: string) {
    this.UserName = value;
  }

  set password(value: string) {
    this.Password = value;
  }

  public getType(): Symbol {
    return this.PAYPAL_PAYMENT;
  }
}
