import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

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
  MockCreditNoteRepo,
} from '@hindawi/shared';

let mockCreditNoteRepo: MockCreditNoteRepo;
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

Before({ tags: '@ValidateRetryRevRec' }, function () {
  mockCreditNoteRepo = new MockCreditNoteRepo();
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
    null,
    loggerService
  );

  createCreditNoteUsecase = new CreateCreditNoteUsecase(
    mockCreditNoteRepo,
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockTransactionRepo,
    mockCouponRepo,
    mockWaiverRepo,
    null
  );
});

Given(
  /^There is an Invoice with the ID "([\w-]+)"$/,
  async function (testInvoiceId: string) {
    invoiceId = testInvoiceId;
    const transactionId = 'transaction-id';
    const maybeManuscript = ManuscriptMap.toDomain({
      id: '8888',
      title: 'manuscript-test',
      customId: 'custom-manuscript',
    });

    if (maybeManuscript.isLeft()) {
      throw maybeManuscript.value;
    }

    manuscript = maybeManuscript.value;

    const maybeTransaction = TransactionMap.toDomain({
      id: transactionId,
    });

    if (maybeTransaction.isLeft()) {
      throw maybeTransaction.value;
    }

    const transaction = maybeTransaction.value;

    const maybeInvoice = InvoiceMap.toDomain({
      transactionId,
      dateCreated: new Date(),
      id: testInvoiceId,
      // * Makes sure it is EP registered already!
      erpReference: 'ERP',
    });

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    const invoice = maybeInvoice.value;

    const maybeInvoiceItem = InvoiceItemMap.toDomain({
      invoiceId: testInvoiceId,
      manuscriptId: '8888',
      price: 100,
    });

    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }

    const invoiceItem = maybeInvoiceItem.value;

    const maybeErpReference = ErpReferenceMap.toDomain({
      entity_id: testInvoiceId,
      entity_type: 'invoice',
      vendor: 'testVendor',
      attribute: 'confirmation',
      value: 'FOO',
    });

    if (maybeErpReference.isLeft()) {
      throw maybeErpReference.value;
    }

    const erpReference = maybeErpReference.value;

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);
    await mockTransactionRepo.save(transaction);
    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);
    await mockManuscriptRepo.save(manuscript);
    await mockErpReferenceRepo.save(erpReference);
  }
);

When('A credit note is created from it', async function () {
  const payload = {
    invoiceId,
    createDraft: false, // don't create draft invoice
  };
  const maybeResult = await createCreditNoteUsecase.execute(payload, context);

  if (maybeResult.isLeft()) {
    throw maybeResult.value;
  }
});

When(
  'The manuscript associated with the invoice is published',
  async function () {
    manuscript.markAsPublished();
    await mockManuscriptRepo.update(manuscript);
  }
);

Then(
  'It should not enlist the credit note for revenue recognition',
  async function () {
    const invoices = await mockInvoiceRepo.getUnrecognizedNetsuiteErpInvoices();

    if (invoices.isLeft()) {
      throw invoices.value;
    }

    expect(invoices.value.length).to.equal(1);
  }
);
