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
  MockErpReferenceRepo,
  ErpReferenceMap,
} from '@hindawi/shared';

let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockManuscriptRepo: MockArticleRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;
let loggerService: LoggerContract;

let revenueRecognitionUseCase: RetryRevenueRecognitionNetsuiteErpInvoicesUsecase;
let createCreditNoteUsecase: CreateCreditNoteUsecase;
let context: UsecaseAuthorizationContext;

let invoiceId: string;
let manuscript: any;

Before(function () {
  mockManuscriptRepo = new MockArticleRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    mockManuscriptRepo,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockTransactionRepo = new MockTransactionRepo();

  context = {
    roles: [Roles.ADMIN],
  };
  loggerService = new MockLogger();

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
    loggerService
  );

  createCreditNoteUsecase = new CreateCreditNoteUsecase(
    mockInvoiceRepo,
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

  const erpReference = ErpReferenceMap.toDomain({
    entity_id: testInvoiceId,
    entity_type: 'invoice',
    vendor: 'testVendor',
    attribute: 'erp',
    value: 'FOO',
  });

  invoice.addInvoiceItem(invoiceItem);
  transaction.addInvoice(invoice);
  await mockTransactionRepo.save(transaction);
  await mockInvoiceRepo.save(invoice);
  await mockInvoiceItemRepo.save(invoiceItem);
  await mockManuscriptRepo.save(manuscript);
  await mockErpReferenceRepo.save(erpReference);
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
