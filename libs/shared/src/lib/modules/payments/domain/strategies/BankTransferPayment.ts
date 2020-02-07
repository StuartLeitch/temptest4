import { BankTransfer } from './BankTransfer';
import { PaymentService } from '../contracts/PaymentService';
import { PaymentGateway } from '../contracts/PaymentGateway';

export class BankTransferPayment extends PaymentService<
  BankTransfer,
  PaymentGateway
> {
  public async makePayment(pm: BankTransfer, amount: number): Promise<any> {
    console.log(`Paying ${amount} using BankTransfer method`);
  }
}
