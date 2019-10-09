import {PaymentModel} from '../contracts/PaymentModel';

export class CreditCard implements PaymentModel {
  CREDIT_CARD_PAYMENT = Symbol.for('@CreditCardPayment');

  public CardHolderName: string;
  public CardNumber: string;
  public ExpirationMonth: number;
  public ExpirationYear: number;

  get cardHolder(): string {
    return this.CardHolderName;
  }

  set cardHolder(value: string) {
    this.CardHolderName = value;
  }

  get cardNumber(): string {
    return this.CardNumber;
  }
  set cardNumber(value: string) {
    this.CardNumber = value;
  }
  get expirationMonth(): number {
    return this.ExpirationMonth;
  }
  set expirationMonth(value: number) {
    this.ExpirationMonth = value;
  }
  get expirationYear(): number {
    return this.ExpirationYear;
  }

  set expirationYear(value: number) {
    this.ExpirationYear = value;
  }

  public getType(): symbol {
    return this.CREDIT_CARD_PAYMENT;
  }
}
