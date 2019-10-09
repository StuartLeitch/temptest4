import {defineFeature, loadFeature} from 'jest-cucumber';

import {PaymentModel} from '../../lib/modules/payments/domain/contracts/PaymentModel';
import {PaymentFactory} from '../../lib/modules/payments/domain/strategies/PaymentFactory';
import {PaymentStrategy} from '../../lib/modules/payments/domain/strategies/PaymentStrategy';
import {CreditCardPayment} from '../../lib/modules/payments/domain/strategies/CreditCardPayment';
import {CreditCard} from '../../lib/modules/payments/domain/strategies/CreditCard';
// import {PayPalPayment} from './../../lib/payments/domain/strategies/PayPalPayment';
// import {PayPal} from '../../lib/payments/domain/strategies/PayPal';

import {BraintreeGateway} from '../../lib/modules/payments/infrastructure/gateways/braintree/gateway';

const feature = loadFeature(
  './specs/features/braintree-payment-gateway.feature'
);

defineFeature(feature, test => {
  let paymentFactory: PaymentFactory;
  let paymentStrategy: PaymentStrategy;

  // let payPal = new PayPal();
  let creditCard = new CreditCard();
  let paymentMethod: PaymentModel;

  beforeEach(() => {
    paymentFactory = new PaymentFactory();
    // paymentFactory.registerPayment(payPal);
    paymentFactory.registerPayment(creditCard);
    paymentStrategy = new PaymentStrategy([
      ['CreditCard', new CreditCardPayment(BraintreeGateway)]
      //   ['PayPal', new PayPalPayment()]
    ]);
  });

  afterEach(() => {
    // do nothing yet
  });

  test('Pay using Braintree SDK', ({given, when, then}) => {
    given('As Payer paying for an APC', async () => {
      // do nothing yet
    });

    when('I choose to pay with CreditCard', () => {
      paymentMethod = paymentFactory.create('CreditCardPayment');
    });

    then('The Braintree Gateway is the default choice', async () => {
      expect(paymentMethod).toBeInstanceOf(CreditCard);

      // const payment: any = await paymentStrategy.makePayment(
      //   paymentMethod,
      //   100
      // );

      // if (payment.success) {
      //   console.log('Transaction ID: ' + payment.transaction.id);
      // } else {
      //   console.error(payment.message);
      // }
    });
  });
});
