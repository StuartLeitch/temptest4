// import {defineFeature, loadFeature} from 'jest-cucumber';

// import {PaymentModel} from '../../lib/modules/payments/domain/contracts/PaymentModel';
// import {PaymentFactory} from '../../lib/modules/payments/domain/strategies/PaymentFactory';
// import {PaymentStrategy} from '../../lib/modules/payments/domain/strategies/PaymentStrategy';
// // import {PayPalPayment} from '../../lib/modules/payments/domain/strategies/PayPalPayment';
// // import {CreditCardPayment} from '../../lib/modules/payments/domain/strategies/CreditCardPayment';
// import {CreditCard} from '../../lib/modules/payments/domain/strategies/CreditCard';
// import {PayPal} from '../../lib/modules/payments/domain/strategies/PayPal';

// const feature = loadFeature('./specs/features/payment-methods.feature');

// defineFeature(feature, test => {
//   let paymentFactory: PaymentFactory;
//   let paymentStrategy: PaymentStrategy;

//   let payPal = new PayPal();
//   let creditCard = new CreditCard();
//   let paymentMethod: PaymentModel;

//   beforeEach(() => {
//     paymentFactory = new PaymentFactory();
//     paymentFactory.registerPayment(payPal);
//     paymentFactory.registerPayment(creditCard);

//     // paymentStrategy = new PaymentStrategy([
//     //   ['CreditCard', new CreditCardPayment()],
//     //   ['PayPal', new PayPalPayment()]
//     // ]);
//   });

//   afterEach(() => {
//     // do nothing yet
//   });

//   test('Pay with CreditCard', ({given, when, and, then}) => {
//     given('As Payer paying for an APC', async () => {
//       // do nothing yet
//     });

//     when('I choose to pay with CreditCard', () => {
//       paymentMethod = paymentFactory.create('CreditCardPayment');
//     });

//     then('A new CreditCardPayment should be created', () => {
//       expect(paymentMethod).toBeInstanceOf(CreditCard);

//       // paymentStrategy.makePayment(paymentMethod, 100);
//     });
//   });

//   test('Pay with PayPal', ({given, when, and, then}) => {
//     given('As Payer paying for an APC', async () => {
//       // do nothing yet
//     });

//     when('I choose to pay with PayPal', () => {
//       paymentMethod = paymentFactory.create('PayPalPayment');
//     });

//     then('A new PayPalPayment should be created', () => {
//       expect(paymentMethod).toBeInstanceOf(PayPal);

//       // paymentStrategy.makePayment(paymentMethod, 100);
//     });
//   });
// });
