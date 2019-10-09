// import {defineFeature, loadFeature} from 'jest-cucumber';

// import {Result} from '../../lib/core/logic/Result';
// import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';
// import {Roles} from '../../lib/modules/users/domain/enums/Roles';

// import {
//   Invoice,
//   STATUS as InvoiceStatus
// } from '../../lib/modules/invoices/domain/Invoice';
// import {UpdateInvoiceDetailsUsecase} from '../../lib/modules/invoices/usecases/updateInvoice/updateInvoiceDetails';
// import {
//   GetInvoiceDetailsUsecase,
//   GetInvoiceDetailsContext
// } from '../../lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails';

// import {MockInvoiceRepo} from '../../lib/modules/invoices/repos/mocks/mockInvoiceRepo';
// import {MockPayerRepo} from '../../lib/modules/payers/repos/mocks/mockPayerRepo';
// import {
//   Payer /*, PayerCollection*/
// } from '../../lib/modules/payers/domain/Payer';
// import {PayerName} from '../../lib/modules/payers/domain/PayerName';
// import {PayerType} from '../../lib/modules/payers/domain/PayerType';
// import {GetPayerUsecase} from '../../lib/modules/payers/usecases/getPayer/getPayer';

// const feature = loadFeature('./specs/features/pay-invoice-resuming.feature');

// const defaultContext: GetInvoiceDetailsContext = {roles: [Roles.SUPER_ADMIN]};

// defineFeature(feature, test => {
//   let mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
//   let mockPayerRepo: MockPayerRepo = new MockPayerRepo();
//   let result: Result<Invoice>;

//   let invoice: Invoice;
//   let payerId: string;
//   let invoiceId: string;

//   let usecase: UpdateInvoiceDetailsUsecase = new UpdateInvoiceDetailsUsecase(
//     mockInvoiceRepo,
//     mockPayerRepo
//   );

//   let getPayerUsecase = new GetPayerUsecase(mockPayerRepo);
//   let getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(mockInvoiceRepo);

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
//         status: InvoiceStatus.DRAFT,
//         payerId: payer.payerId
//       },
//       new UniqueEntityID(invoiceId)
//     ).getValue();
//     mockInvoiceRepo.save(invoice);
//   });

//   test('Resuming pay invoice flow', ({given, when, then}) => {
//     given('As a Payer reviewing Transaction Details', () => {});

//     when(/^I select \"(\w+)"$/, async (payerType: string) => {
//       result = await usecase.execute(
//         {
//           invoiceId,
//           payerType
//         },
//         defaultContext
//       );

//       invoice = result.getValue();
//     });

//     then('the invoice should be updated', () => {
//       expect(result.isSuccess).toBe(true);
//     });

//     given('As a Payer reviewing Transaction Details', async () => {
//       const invoiceResult = await getInvoiceDetailsUsecase.execute(
//         {
//           invoiceId
//         },
//         defaultContext
//       );

//       invoice = invoiceResult.getValue();
//     });

//     then(
//       /the invoice should have \"(\w+)" payment mode$/,
//       async (payerType: string) => {
//         const {payerId} = invoice;

//         const payerResult = await getPayerUsecase.execute(
//           {
//             payerId: payerId.id.toString()
//           },
//           defaultContext
//         );

//         const payer = payerResult.getValue();

//         expect(payer.type.value).toEqual(payerType);
//       }
//     );
//   });
// });
