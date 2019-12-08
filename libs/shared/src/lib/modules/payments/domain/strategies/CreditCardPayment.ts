import { CreditCard } from './CreditCard';
import { PaymentService } from '../contracts/PaymentService';
import { PaymentGateway } from '../contracts/PaymentGateway';
export class CreditCardPayment extends PaymentService<
  CreditCard,
  PaymentGateway
> {
  constructor(private paymentGateway: PaymentGateway) {
    super();
    this.paymentGateway = paymentGateway;
  }

  public async makePayment(pm: CreditCard, amount: number): Promise<any> {
    console.log(
      `Paying ${amount} using Credit Card method with "${this.paymentGateway.config.environment.server}"`
    );
  }
}
