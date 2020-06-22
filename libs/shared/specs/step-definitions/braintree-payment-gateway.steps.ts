// import { expect } from 'chai';
// import { Given, When, Then, Before } from 'cucumber';

// import { PaymentModel } from '../../src/lib/modules/payments/domain/contracts/PaymentModel';
// import { PaymentFactory } from '../../src/lib/modules/payments/domain/strategies/PaymentFactory';
// import { PaymentStrategy } from '../../src/lib/modules/payments/domain/strategies/PaymentStrategy';
// import { CreditCardPayment } from '../../src/lib/modules/payments/domain/strategies/CreditCardPayment';
// import { CreditCard } from '../../src/lib/modules/payments/domain/strategies/CreditCard';
// // import {PayPalPayment} from './../../lib/payments/domain/strategies/PayPalPayment';
// // import {PayPal} from '../../lib/payments/domain/strategies/PayPal';

// import { BraintreeGateway } from '../../src/lib/modules/payments/infrastructure/gateways/braintree/gateway';

// let paymentFactory: PaymentFactory;
// let paymentStrategy: PaymentStrategy;

// // let payPal = new PayPal();
// const creditCard = new CreditCard();
// let paymentMethod: any;

// Before(() => {
//   paymentFactory = new PaymentFactory();
//   // paymentFactory.registerPayment(payPal);
//   paymentFactory.registerPayment(creditCard);
//   paymentStrategy = new PaymentStrategy([
//     ['CreditCard', new CreditCardPayment(BraintreeGateway)],
//     //   ['PayPal', new PayPalPayment()]
//   ]);
// });

// Given('As Payer paying for an APC', async () => {
//   // do nothing yet
// });

// When('I choose to pay with CreditCard', () => {
//   paymentMethod = paymentFactory.create('CreditCardPayment');
//   console.log(paymentMethod);
// });

// Then('The Braintree Gateway is the default choice', async () => {
//   expect(paymentMethod).is.instanceOf(CreditCard);

//   // const payment: any = await paymentStrategy.makePayment(
//   //   paymentMethod,
//   //   100
//   // );

//   // if (payment.success) {
//   //   console.log('Transaction ID: ' + payment.transaction.id);
//   // } else {
//   //   console.error(payment.message);
//   // }
// });
