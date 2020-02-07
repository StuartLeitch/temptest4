import { PaymentModel } from '../contracts/PaymentModel';

export class BankTransfer implements PaymentModel {
  BANK_TRANSFER_PAYMENT = Symbol.for('@BankTransferPayment');

  public InvoiceId: string;
  public PaymentMethodId: string;
  public PaymentReference: string;
  public Amount: number;
  public DatePaid: Date;

  get invoiceId(): string {
    return this.InvoiceId;
  }

  set invoiceId(newValue: string) {
    this.InvoiceId = newValue;
  }

  get paymentMethodId(): string {
    return this.PaymentMethodId;
  }

  set paymentMethodId(newValue: string) {
    this.PaymentMethodId = newValue;
  }

  get amount(): number {
    return this.Amount;
  }

  set amount(newValue: number) {
    this.Amount = newValue;
  }

  get paymentReference(): string {
    return this.PaymentReference;
  }

  set paymentReference(newValue: string) {
    this.PaymentReference = newValue;
  }

  get datePaid(): Date {
    return this.DatePaid;
  }

  set datePaid(newValue: Date) {
    this.DatePaid = newValue;
  }

  public getType(): symbol {
    return this.BANK_TRANSFER_PAYMENT;
  }
}
