import {PaymentStrategyContract} from '../contracts/PaymentStrategy';
import {BankTransfer} from './BankTransfer';

export class BankTransferPayment implements PaymentStrategyContract {
  // private accountNumber: string = '';

  public makePayment(pm: BankTransfer, amount = 0) {
    console.info(`Paying ${amount} using Bank Transfer.`);
  }
}
