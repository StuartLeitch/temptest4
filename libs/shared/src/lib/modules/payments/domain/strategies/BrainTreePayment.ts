import { PaymentClientToken } from '../../../../domain/PaymentClientToken';
import { PaymentService } from '../contracts/PaymentService';
import { PaymentGateway } from '../contracts/PaymentGateway';
import { Braintree } from './Braintree';

export class BraintreePayment extends PaymentService<
  Braintree,
  PaymentGateway
> {
  private merchantId: string;

  constructor(private paymentGateway: PaymentGateway, merchantId: string) {
    super();
    this.paymentGateway = paymentGateway;
    this.merchantId = merchantId;
  }

  public async makePayment(pm: Braintree, amount: number): Promise<any> {
    console.log(
      `Paying ${amount} using Braintree method with "${this.paymentGateway.config.environment.server}"`
    );

    return this.createTransaction(pm.paymentMethodNonce, amount);
  }

  private async createTransaction(
    paymentMethodNonce: string,
    amount: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentGateway.transaction.sale(
        {
          amount,
          paymentMethodNonce,
          options: {
            // threeDSecure: true,
            submitForSettlement: true
          }
        },
        (err: any, result: any) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        }
      );
    });
  }

  public async generateClientToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentGateway.clientToken.generate(
        { merchantAccountId: this.merchantId },
        (err: any, response: any) => {
          const { clientToken } = response;
          return resolve(PaymentClientToken.create(clientToken));
        }
      );
    });
  }
}
