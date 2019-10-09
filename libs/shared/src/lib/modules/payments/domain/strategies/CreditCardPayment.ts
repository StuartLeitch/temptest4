import {CreditCard} from './CreditCard';
import {PaymentService} from '../contracts/PaymentService';
import {PaymentGateway} from '../contracts/PaymentGateway';

export class CreditCardPayment extends PaymentService<
  CreditCard,
  PaymentGateway
> {
  // private ccNum: string = '';
  // private ccType: string = '';
  // private cvvNum: string = '';
  // private ccExpMonth: string = '';
  // private ccExpYear: string = '';

  constructor(private paymentGateway: PaymentGateway) {
    super();
    this.paymentGateway = paymentGateway;
  }

  public async makePayment(pm: CreditCard, amount: number): Promise<any> {
    console.log(
      `Paying ${amount} using Credit Card method with "${this.paymentGateway.config.environment.server}"`
    );

    // const clientToken: string = await this.generateClientToken();
    // await this.findPaymentMethodNonce(paymentMethodNonce);
    // const paymentMethod = await this.createPaymentMethod();
    const paymentMethodNonce = await this.createPaymentMethodNonce();

    return this.createTransaction(paymentMethodNonce, amount);
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

  // private async generateClientToken(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.paymentGateway.clientToken.generate(
  //       {},
  //       (err: any, response: any) => {
  //         const {clientToken} = response;
  //         return resolve(clientToken);
  //       }
  //     );
  //   });
  // }

  // private async createPaymentMethod(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.paymentGateway.paymentMethod.create(
  //       {},
  //       (err: any, response: any) => {
  //         const {clientToken} = response;
  //         return resolve(clientToken);
  //       }
  //     );
  //   });
  // }

  private async createPaymentMethodNonce(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentGateway.paymentMethodNonce.create(
        'PersonalCard',
        (err: any, response: any) => {
          if (err) {
            console.info(err);
            return reject(err);
          }
          const {nonce} = response.paymentMethodNonce;
          return resolve(nonce);
        }
      );
    });
  }

  // private async findPaymentMethodNonce(nonce: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.paymentGateway.paymentMethodNonce.find(
  //       nonce,
  //       (err: any, response: any) => {
  //         if (err) {
  //           console.info(err);
  //           return reject(err);
  //         }
  //         console.info(response);
  //         // const {nonce} = response.paymentMethodNonce;
  //         // return resolve(nonce);
  //       }
  //     );
  //   });
  // }
}
