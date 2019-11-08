// import {defineFeature, loadFeature} from 'jest-cucumber';

// import {PaymentModel} from '../../src/lib/modules/payments/domain/contracts/PaymentModel';
// import {PaymentFactory} from '../../src/lib/modules/payments/domain/strategies/PaymentFactory';
// import {PaymentStrategy} from '../../src/lib/modules/payments/domain/strategies/PaymentStrategy';
// import {PayPalPayment} from '../../src/lib/modules/payments/domain/strategies/PayPalPayment';
// import {CreditCardPayment} from '../../src/lib/modules/payments/domain/strategies/CreditCardPayment';
// import {CreditCard} from '../../src/lib/modules/payments/domain/strategies/CreditCard';
// import {PayPal} from '../../src/lib/modules/payments/domain/strategies/PayPal';

// const feature = loadFeature('../features/payment-methods.feature', {
//   loadRelativePath: true
// });

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

//     paymentStrategy = new PaymentStrategy([
//       ['CreditCard', new CreditCardPayment()],
//       ['PayPal', new PayPalPayment()]
//     ]);
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
