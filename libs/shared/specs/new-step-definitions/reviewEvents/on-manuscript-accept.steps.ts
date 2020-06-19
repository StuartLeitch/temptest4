// import { expect } from 'chai';
// import { Given, When, Then, Before } from 'cucumber';

// import { Roles } from '../../../src/lib/modules/users/domain/enums/Roles';
// import { Invoice } from '../../../src/lib/modules/invoices/domain/Invoice';
// import { InvoiceItem } from '../../../src/lib/modules/invoices/domain/InvoiceItem';
// import { InvoiceStatus } from '../../../src/lib/modules/invoices/domain/Invoice';
// import { CatalogItem } from './../../../src/lib/modules/journals/domain/CatalogItem';
// import { Article } from '../../../src/lib/modules/manuscripts/domain/Article';
// import {
//   Transaction,
//   TransactionStatus,
// } from '../../../src/lib/modules/transactions/domain/Transaction';

// import { ArticleRepoContract } from '../../../src/lib/modules/manuscripts/repos/articleRepo';
// import { TransactionRepoContract } from './../../../src/lib/modules/transactions/repos/transactionRepo';
// import { InvoiceItemRepoContract } from './../../../src/lib/modules/invoices/repos/invoiceItemRepo';
// import { InvoiceRepoContract } from './../../../src/lib/modules/invoices/repos/invoiceRepo';
// import { CatalogRepoContract } from './../../../src/lib/modules/journals/repos/catalogRepo';
// import { WaiverRepoContract } from '../../../src/lib/modules/waivers/repos/waiverRepo';
// import { EditorRepoContract } from './../../../src/lib/modules/journals/repos/editorRepo';
// import { PayerRepoContract } from './../../../src/lib/modules/payers/repos/payerRepo';
// import { CouponRepoContract } from './../../../src/lib/modules/coupons/repos/couponRepo';

// import { InvoiceMap } from './../../../src/lib/modules/invoices/mappers/InvoiceMap';
// import { InvoiceItemMap } from './../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
// import { TransactionMap } from './../../../src/lib/modules/transactions/mappers/TransactionMap';
// import { CatalogMap } from './../../../src/lib/modules/journals/mappers/CatalogMap';
// import { ArticleMap } from '../../../src/lib/modules/manuscripts/mappers/ArticleMap';

// import { MockTransactionRepo } from '../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
// import { MockArticleRepo } from '../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
// import { MockInvoiceRepo } from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
// import { MockCatalogRepo } from '../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
// import { MockEditorRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockEditorRepo';
// import { MockInvoiceItemRepo } from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
// import { MockWaiverRepo } from '../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
// import { MockCouponRepo } from './../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
// import { MockPayerRepo } from './../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
// import { MockAddressRepo } from './../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';

// import { WaiverService } from '../../../src/lib/domain/services/WaiverService';
// import { EmailService } from './../../../src/lib/infrastructure/communication-channels/EmailService';
// import { VATService } from '../../../../../libs/shared/src/lib/shared';

// import { UpdateTransactionContext } from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscriptAuthorizationContext';
// import { UpdateTransactionOnAcceptManuscriptUsecase } from '../../../src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';
// import { AddressRepoContract } from '../../../src/lib/modules/addresses/repos/addressRepo';

// const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

// const mockTransactionRepo: TransactionRepoContract = new MockTransactionRepo();
// const mockInvoiceRepo: InvoiceRepoContract = new MockInvoiceRepo();
// const mockCatalogRepo: CatalogRepoContract = new MockCatalogRepo();
// const mockInvoiceItemRepo: InvoiceItemRepoContract = new MockInvoiceItemRepo();
// const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();
// const mockWaiverRepo: WaiverRepoContract = new MockWaiverRepo();
// const mockEditorRepo: EditorRepoContract = new MockEditorRepo();
// const mockAddressRepo: AddressRepoContract = new MockAddressRepo();
// const mockPayerRepo: PayerRepoContract = new MockPayerRepo();
// const mockCouponRepo: CouponRepoContract = new MockCouponRepo();

// const waiverService: WaiverService = new WaiverService(
//   mockWaiverRepo,
//   mockEditorRepo
// );
// const emailService: EmailService = new EmailService(
//   true,
//   process.env.FE_ROOT,
//   process.env.TENANT_NAME
// );
// const vatService: VATService = new VATService();
// const loggerService: any = null;

// const usecase: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
//   mockAddressRepo,
//   mockCatalogRepo,
//   mockTransactionRepo,
//   mockInvoiceItemRepo,
//   mockInvoiceRepo,
//   mockArticleRepo,
//   mockWaiverRepo,
//   mockPayerRepo,
//   mockCouponRepo,
//   waiverService,
//   emailService,
//   vatService,
//   loggerService
// );

// let transaction: Transaction;
// let invoice: Invoice;
// let invoiceItem: InvoiceItem;
// let catalogItem: CatalogItem;
// let manuscript: Article;
// let result: any;

// const manuscriptId = 'manuscript-id';
// const journalId = 'journal-id';

// Before(function () {
//   transaction = TransactionMap.toDomain({
//     status: TransactionStatus.DRAFT,
//     deleted: 0,
//     dateCreated: new Date(),
//     dateUpdated: new Date(),
//   });
//   invoice = InvoiceMap.toDomain({
//     status: InvoiceStatus.DRAFT,
//     transactionId: transaction.transactionId,
//   });
//   invoiceItem = InvoiceItemMap.toDomain({
//     manuscriptId,
//     invoiceId: invoice.invoiceId.id.toString(),
//   });

//   invoice.addInvoiceItem(invoiceItem);
//   transaction.addInvoice(invoice);

//   mockTransactionRepo.save(transaction);
//   mockInvoiceRepo.save(invoice);
//   mockInvoiceItemRepo.save(invoiceItem);
// });

// Given('Invoicing listening to events emitted by Review', async function () {
//   console.log('aaa');
// });

// Given(/^The APC Catalog Item has a price of (\d+)$/, async function (
//   price: number
// ) {
//   catalogItem = CatalogMap.toDomain({
//     journalId,
//     type: 'APC',
//     price: price,
//   });
//   mockCatalogRepo.save(catalogItem);
// });

// Given('The Author is from a Waived Country', async function () {
//   const title = 'manuscript-title';
//   const articleTypeId = 'article-type-id';
//   const authorEmail = 'author@email.com';
//   const authorCountry = 'MD';
//   const authorSurname = 'Author Surname';

//   manuscript = ArticleMap.toDomain({
//     id: manuscriptId,
//     title,
//     articleTypeId,
//     authorEmail,
//     authorCountry,
//     authorSurname,
//   });
//   mockArticleRepo.save(manuscript);
// });

// When('A manuscript accept event is published', async function () {
//   result = await usecase.execute(
//     {
//       manuscriptId,
//       confirmationReminder: {
//         queueName: 'test',
//         delay: 0.001,
//       },
//       // journalId,
//     },
//     defaultContext
//   );
// });

// Then(
//   'The Transaction associated with the manuscript should be ACTIVE',
//   async () => {
//     expect(result.value.isSuccess).to.equal(true);

//     const transactions = await mockTransactionRepo.getTransactionCollection();
//     const [associatedTransaction] = transactions;

//     expect(associatedTransaction.status).to.equal(TransactionStatus.ACTIVE);
//   }
// );

// Then(
//   'The Invoice Item associated with the manuscript should have the price of 950',
//   async () => {
//     const invoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
//     const [associatedInvoiceItem] = invoiceItems;

//     expect(associatedInvoiceItem.price).to.equal(950);
//   }
// );
