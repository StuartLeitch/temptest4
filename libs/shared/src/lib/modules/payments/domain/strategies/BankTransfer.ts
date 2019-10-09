import {PaymentModel} from '../contracts/PaymentModel';

export class BankTransfer implements PaymentModel {
  BANK_TRANSFER_PAYMENT = Symbol.for('@BankTransferPayment');

  public _accountNumber: string;

  get accountNumber(): string {
    return this._accountNumber;
  }

  set accountNumber(value: string) {
    this._accountNumber = value;
  }

  public getType(): symbol {
    return this.BANK_TRANSFER_PAYMENT;
  }
}
