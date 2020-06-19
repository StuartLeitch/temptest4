// import { defineFeature, loadFeature } from 'jest-cucumber';

// import { UniqueEntityID } from '../../src/lib/core/domain/UniqueEntityID';
// import {
//   Invoice,
//   InvoiceStatus
// } from '../../src/lib/modules/invoices/domain/Invoice';

// import { Payer, PayerType } from '../../src/lib/modules/payers/domain/Payer';
// import { PayerName } from '../../src/lib/modules/payers/domain/PayerName';
// import { PayerMap } from './../../src/lib/modules/payers/mapper/Payer';

// import { PoliciesRegister } from '../../src/lib/domain/reductions/policies/PoliciesRegister';
// import { WaivedCountryPolicy } from '../../src/lib/domain/reductions/policies/WaivedCountryPolicy';
// import { TransactionId } from './../../src/lib/modules/transactions/domain/TransactionId';

// const feature = loadFeature('../features/reduction-policies.feature', {
//   loadRelativePath: true
// });

// defineFeature(feature, test => {
//   let invoice: Invoice;

//   let waivedCountryPolicy: WaivedCountryPolicy;
//   let policiesRegister: PoliciesRegister;

//   let countryCode: string;
//   let payerId: string;
//   let invoiceId: string;
//   let reductions: any;

//   beforeEach(() => {
//     payerId = 'test-payer';
//     invoiceId = 'test-invoice';

//     const payer = PayerMap.toDomain({
//       id: payerId,
//       invoiceId,
//       name: 'foo',
//       type: PayerType.INDIVIDUAL
//     });

//     invoice = Invoice.create(
//       {
//         transactionId: TransactionId.create(
//           new UniqueEntityID('transaction-id')
//         ),
//         status: InvoiceStatus.DRAFT,
//         payerId: payer.payerId
//       },
//       new UniqueEntityID(invoiceId)
//     ).getValue();

//     policiesRegister = new PoliciesRegister();
//   });

//   afterEach(() => {
//     // do nothing yet
//   });

//   test('WaiverCountry reduction', ({ given, when, and, then }) => {
//     given(/^The Author is in (\w+)$/, (country: string) => {
//       countryCode = country;
//       waivedCountryPolicy = new WaivedCountryPolicy();
//       policiesRegister.registerPolicy(waivedCountryPolicy);
//     });

//     and('The Author purchases an APC', () => {});

//     when(
//       /^The invoice net value is (\d+)$/,
//       async (invoiceNetValue: string) => {
//         reductions = policiesRegister.applyPolicy(
//           waivedCountryPolicy.getType(),
//           [countryCode]
//         );

//         const reduction = reductions.getReduction();
//       }
//     );

//     then(
//       /^The invoice total amount is (\d+)$/,
//       async (expectedTotalAmount: string) => {
//         // expect(invoice.getValue()).toEqual(parseInt(expectedTotalAmount, 10));
//       }
//     );
//   });
// });
