import {PaymentService} from '../contracts/PaymentService';
import {PayPal} from './PayPal';

export class PayPalPayment extends PaymentService<PayPal> {
  // private payPalEmail: string = '';

  public makePayment(pm: PayPal, amount: number) {
    console.info(`Paying ${amount} using PayPal`);
  }
}
