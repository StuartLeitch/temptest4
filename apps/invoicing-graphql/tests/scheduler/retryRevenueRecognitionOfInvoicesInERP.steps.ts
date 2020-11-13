import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import {
  UsecaseAuthorizationContext,
  Roles,
  TransactionMap,
  InvoiceMap,
  InvoiceItemMap,
  LoggerContract,
  MockLogger,
  MockTransactionRepo,
  MockArticleRepo,
  MockInvoiceItemRepo,
  MockInvoiceRepo,
  MockCouponRepo,
  MockWaiverRepo,
  RetryRevenueRecognitionNetsuiteErpInvoicesUsecase,
  CreateCreditNoteUsecase,
  ManuscriptMap,
} from '@hindawi/shared';

import {
  // addBillingAddresses,
  // addPaymentMethods,
  addInvoiceItems,
  addManuscripts,
  addInvoices,
  // addPayments,
  // addCoupons,
  // addWaivers,
  // addPayers,
} from './testUtils';

// let mockPaymentMethodRepo: MockPaymentMethodRepo;
// let mockSqsPublishService: MockSQSPublishService;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockManuscriptRepo: MockArticleRepo;
// let mockAddressRepo: MockAddressRepo;
let mockInvoiceRepo: MockInvoiceRepo;
// let mockPaymentRepo: MockPaymentRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
// let mockPayerRepo: MockPayerRepo;
let mockTransactionRepo: MockTransactionRepo;
let loggerService: LoggerContract;

let revenueRecognitionUseCase: RetryRevenueRecognitionNetsuiteErpInvoicesUsecase;
let createCreditNoteUsecase: CreateCreditNoteUsecase;
let context: UsecaseAuthorizationContext;

// let payload;
// let event;
let invoiceId: string;
let manuscript: any;

Before(function () {
  // mockPaymentMethodRepo = new MockPaymentMethodRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockManuscriptRepo = new MockArticleRepo();
  // mockAddressRepo = new MockAddressRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo
  );
  // mockPaymentRepo = new MockPaymentRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  // mockPayerRepo = new MockPayerRepo();
  mockTransactionRepo = new MockTransactionRepo();

  context = {
    roles: [Roles.ADMIN],
  };
  loggerService = new MockLogger();

  // addPaymentMethods(mockPaymentMethodRepo);
  // addBillingAddresses(mockAddressRepo);
  // addInvoiceItems(mockInvoiceItemRepo);
  // addManuscripts(mockManuscriptRepo);
  // addInvoices(mockInvoiceRepo);
  // addPayments(mockPaymentRepo);
  // addCoupons(mockCouponRepo);
  // addWaivers(mockWaiverRepo);
  // addPayers(mockPayerRepo);

  revenueRecognitionUseCase = new RetryRevenueRecognitionNetsuiteErpInvoicesUsecase(
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockCouponRepo,
    mockWaiverRepo,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    // mockPaymentMethodRepo,
    // mockSqsPublishService,
    // mockManuscriptRepo,
    // mockAddressRepo,
    // mockPaymentRepo,
    // mockPayerRepo,
    loggerService
  );

  createCreditNoteUsecase = new CreateCreditNoteUsecase(
    mockInvoiceRepo,
    // null,
    mockInvoiceItemRepo,
    mockTransactionRepo,
    mockCouponRepo,
    mockWaiverRepo,
    null,
    null
  );
});

Given(/^There is an Invoice with the ID "([\w-]+)"$/, async function (
  testInvoiceId: string
) {
  invoiceId = testInvoiceId;
  const transactionId = 'transaction-id';
  manuscript = ManuscriptMap.toDomain({
    id: '8888',
    title: 'manuscript-test',
    customId: 'custom-manuscript',
  });
  const transaction = TransactionMap.toDomain({
    id: transactionId,
  });
  const invoice = InvoiceMap.toDomain({
    transactionId: 'transaction-id',
    dateCreated: new Date(),
    id: testInvoiceId,
    // * Makes sure it is EP registered already!
    erpReference: 'ERP',
  });
  const invoiceItem = InvoiceItemMap.toDomain({
    invoiceId: testInvoiceId,
    manuscriptId: '8888',
    price: 100,
  });

  invoice.addInvoiceItem(invoiceItem);
  transaction.addInvoice(invoice);
  await mockTransactionRepo.save(transaction);
  await mockInvoiceRepo.save(invoice);
  await mockInvoiceItemRepo.save(invoiceItem);
  await mockManuscriptRepo.save(manuscript);
});

When('A credit note is created from it', async function () {
  const payload = {
    invoiceId,
    createDraft: false, // don't create draft invoice
  };
  await createCreditNoteUsecase.execute(payload, context);
});

When(
  'The manuscript associated with the invoice is published',
  async function () {
    manuscript.markAsPublished();
  }
);

Then(
  'It should not enlist the credit note for revenue recognition',
  async function () {
    const invoices = await mockInvoiceRepo.getUnrecognizedNetsuiteErpInvoices();
    expect(invoices.length).to.equal(1);
  }
);
