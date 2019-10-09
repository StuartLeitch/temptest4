import {PaymentModel} from '../contracts/PaymentModel';

export class BankTransfer implements PaymentModel {
  BANK_TRANSFER_PAYMENT = Symbol.for('@BankTransferPayment');

  public AccountNumber: string;

  get accountNumber(): string {
    return this.AccountNumber;
  }

  set accountNumber(value: string) {
    this.AccountNumber = value;
  }

  public getType(): Symbol {
    return this.BANK_TRANSFER_PAYMENT;
  }
}
