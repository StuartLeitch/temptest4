/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  PaymentStrategy,
  CreditCardPayment,
  PaymentFactory,
  CreditCard,
} from '@hindawi/shared';
// tslint:disable-next-line
import { BraintreeGateway } from '../../../../libs/shared/src/lib/modules/payments/infrastructure/gateways/braintree/gateway';

export class CheckoutService {
  public async pay(payment: any): Promise<any> {
    console.log('Create a new payment => ', payment);

    const paymentFactory: PaymentFactory = new PaymentFactory();
    const creditCard = new CreditCard();
    paymentFactory.registerPayment(creditCard);
    const paymentMethod = paymentFactory.create('CreditCardPayment');
    const paymentStrategy = new PaymentStrategy([
      ['CreditCard', new CreditCardPayment(BraintreeGateway)],
    ]);

    const braintreePayment: any = await paymentStrategy.makePayment(
      paymentMethod,
      payment.amount
    );

    if (braintreePayment.success) {
      console.log('Transaction ID => ' + braintreePayment.transaction.id);
      return braintreePayment.transaction;
    }
  }
}
