import {PaymentModel} from '../contracts/PaymentModel';

export class PayPal implements PaymentModel {
  PAYPAL_PAYMENT = Symbol.for('@PayPalPayment');

  public _userName: string;
  public _password: string;

  get userName(): string {
    return this._userName;
  }

  set userName(value: string) {
    this._userName = value;
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  public getType(): symbol {
    return this.PAYPAL_PAYMENT;
  }
}
