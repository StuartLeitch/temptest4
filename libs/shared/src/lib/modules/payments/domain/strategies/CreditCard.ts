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

  get cardNumber(): string {
    return this.CardNumber;
  }

  get expirationMonth(): number {
    return this.ExpirationMonth;
  }

  get expirationYear(): number {
    return this.ExpirationYear;
  }

  set cardHolder(value: string) {
    this.CardHolderName = value;
  }

  set cardNumber(value: string) {
    this.CardNumber = value;
  }

  set expirationMonth(value: number) {
    this.ExpirationMonth = value;
  }

  set expirationYear(value: number) {
    this.ExpirationYear = value;
  }

  public getType(): Symbol {
    return this.CREDIT_CARD_PAYMENT;
  }
}
