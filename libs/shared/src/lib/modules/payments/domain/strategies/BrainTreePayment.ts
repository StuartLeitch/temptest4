import { PaymentClientToken } from '../../../../domain/PaymentClientToken';
import { PaymentService } from '../contracts/PaymentService';
import { PaymentGateway } from '../contracts/PaymentGateway';
import { Braintree } from './Braintree';

export class BraintreePayment extends PaymentService<
  Braintree,
  PaymentGateway
> {
  constructor(private paymentGateway: PaymentGateway) {
    super();
    this.paymentGateway = paymentGateway;
  }

  public async makePayment(pm: Braintree, amount: number): Promise<any> {
    console.log(
      `Paying ${amount} using Braintree method with "${this.paymentGateway.config.environment.server}"`
    );

    return this.createTransaction(
      pm.invoiceReferenceNumber,
      pm.manuscriptCustomId,
      pm.paymentMethodNonce,
      pm.merchantAccountId,
      amount
    );
  }

  private async createTransaction(
    invoiceReferenceNumber: string,
    manuscriptCustomId: string,
    paymentMethodNonce: string,
    merchantAccountId: string,
    amount: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentGateway.transaction.sale(
        {
          amount,
          merchantAccountId,
          paymentMethodNonce,
          options: {
            // threeDSecure: true,
            submitForSettlement: true
          },
          customFields: {
            manuscript: manuscriptCustomId
          },
          orderId: invoiceReferenceNumber
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

  public async generateClientToken(merchantAccountId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentGateway.clientToken.generate(
        { merchantAccountId: merchantAccountId },
        (err: any, response: any) => {
          const { clientToken } = response;
          return resolve(PaymentClientToken.create(clientToken));
        }
      );
    });
  }
}
