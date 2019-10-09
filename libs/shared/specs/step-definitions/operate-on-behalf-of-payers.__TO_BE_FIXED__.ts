// import {defineFeature, loadFeature} from 'jest-cucumber';

// import {Result} from '../../lib/core/Result';
// import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';

// import {
//   Invoice,
//   STATUS as InvoiceStatus
// } from '../../lib/invoices/domain/Invoice';
// import {UpdateInvoiceDetailsUsecase} from '../../lib/invoices/usecases/updateInvoice/updateInvoiceDetails';

// import {MockInvoiceRepo} from '../../lib/invoices/repos/mocks/mockInvoiceRepo';
// import {MockUserRepo} from '../../lib/users/repos/mocks/mockUserRepo';
// import {Admin /*, PayerCollection*/} from '../../lib/users/domain/Admin';
// // import {PayerName} from '../../lib/payers/domain/PayerName';
// // import {PayerType} from '../../lib/payers/domain/PayerType';

// const feature = loadFeature(
//   './specs/features/operate-on-behalf-of-payers.feature'
// );

// defineFeature(feature, test => {
//   let mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
//   let mockUserRepo: MockUserRepo = new MockPayerRepo();
//   let result: Result<Invoice>;

//   let payerId;
//   let invoiceId;

//   let usecase: UpdateInvoiceDetailsUsecase = new UpdateInvoiceDetailsUsecase(
//     mockInvoiceRepo,
//     mockPayerRepo
//   );

//   beforeEach(() => {
//     payerId = 'test-payer';
//     const payer = Payer.create(
//       {
//         name: PayerName.create('foo').getValue(),
//         surname: PayerName.create('bar').getValue(),
//         type: PayerType.create('individual').getValue()
//       },
//       new UniqueEntityID(payerId)
//     ).getValue();
//     mockPayerRepo.save(payer);

//     invoiceId = 'test-invoice';
//     const invoice = Invoice.create(
//       {
//         status: InvoiceStatus.INITIATED,
//         payerId: payer.payerId
//       },
//       new UniqueEntityID(invoiceId)
//     ).getValue();
//     mockInvoiceRepo.save(invoice);
//   });

//   test('Edit Transaction Details', ({given, when, then}) => {
//     given('As a Payer updating Transaction Details', () => {});

//     when(/^I select \"(\w+)"$/, async (payerType: string) => {
//       result = await usecase.execute({
//         invoiceId,
//         payerType
//       });
//     });

//     then('the invoice should be updated', () => {
//       expect(result.isSuccess).toBe(true);
//     });
//   });

//   test('Edit Invoice Details', ({given, when, then}) => {
//     given('As a Payer updating Transaction Details', () => {});

//     when(/^I select \"(\w+)"$/, async (payerType: string) => {
//       result = await usecase.execute({
//         invoiceId,
//         payerType
//       });
//     });

//     then('the invoice should be updated', () => {
//       expect(result.isSuccess).toBe(true);
//     });
//   });
// });
