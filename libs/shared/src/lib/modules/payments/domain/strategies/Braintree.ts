import { PaymentModel } from '../contracts/PaymentModel';

export class Braintree implements PaymentModel {
  BRAINTREE_PAYMENT = Symbol.for('@BraintreePayment');

  private InvoiceReferenceNumber: string;
  private ManuscriptCustomId: string;
  private MerchantAccountId: string;

  public PaymentMethodNonce: string;

  get paymentMethodNonce(): string {
    return this.PaymentMethodNonce;
  }

  set paymentMethodNonce(value: string) {
    this.PaymentMethodNonce = value;
  }

  get manuscriptCustomId(): string {
    return this.ManuscriptCustomId;
  }

  set manuscriptCustomId(newValue: string) {
    this.ManuscriptCustomId = newValue;
  }

  get invoiceReferenceNumber(): string {
    return this.InvoiceReferenceNumber;
  }

  set invoiceReferenceNumber(newValue: string) {
    this.InvoiceReferenceNumber = newValue;
  }

  get merchantAccountId(): string {
    return this.MerchantAccountId;
  }

  set merchantAccountId(newValue: string) {
    this.MerchantAccountId = newValue;
  }

  public getType(): symbol {
    return this.BRAINTREE_PAYMENT;
  }
}
