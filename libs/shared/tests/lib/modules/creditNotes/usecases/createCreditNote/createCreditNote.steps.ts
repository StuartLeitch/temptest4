import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import { CreationReason } from '../../../../../../src';
import { MockCreditNoteRepo } from '../../../../../../src/lib/modules/creditNotes/repos/mocks/mockCreditNoteRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockCouponRepo } from './../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from './../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockPausedReminderRepo } from '../../../../../../src/lib/modules/notifications/repos/mocks/mockPausedReminderRepo';
import { MockEditorRepo } from './../../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockErpReferenceRepo } from './../../../../../../src/lib/modules/vendors/repos/mocks/mockErpReferenceRepo';

import {
  Invoice,
  InvoiceCollection,
} from './../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from './../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

import { CreateCreditNoteUsecase } from '../../../../../../src/lib/modules/creditNotes/usecases/createCreditNote/createCreditNote';
import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../src/lib/domain/authorization';
import { WaiverService } from './../../../../../../src/lib/domain/services/WaiverService';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { Transaction } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { InvoiceItemMap } from '../../../../../../src';
import { CreateCreditNoteResponse } from '../../../../../../src/lib/modules/creditNotes/usecases/createCreditNote/createCreditNoteResponse';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

let mockCreditNoteRepo: MockCreditNoteRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockPausedReminderRepo: MockPausedReminderRepo;
let mockEditorRepo: MockEditorRepo;
let mockErpReferenceRepo: MockErpReferenceRepo;

let mockWaiverService: WaiverService;

let usecase: CreateCreditNoteUsecase;
let invoiceCollection: InvoiceCollection;
let transaction: Transaction;
let invoice: Invoice;
let result: CreateCreditNoteResponse;

Before({ tags: '@ValidateCreateCreditNoteUsecase' }, async () => {
  mockCreditNoteRepo = new MockCreditNoteRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockTransactionRepo = new MockTransactionRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();
  mockPausedReminderRepo = new MockPausedReminderRepo();
  mockEditorRepo = new MockEditorRepo();
  mockErpReferenceRepo = new MockErpReferenceRepo();
  mockInvoiceRepo = new MockInvoiceRepo(
    null,
    mockInvoiceItemRepo,
    mockErpReferenceRepo
  );
  mockWaiverService = new WaiverService(
    mockInvoiceItemRepo,
    mockEditorRepo,
    mockWaiverRepo
  );

  usecase = new CreateCreditNoteUsecase(
    mockCreditNoteRepo,
    mockInvoiceRepo,
    mockInvoiceItemRepo,
    mockCouponRepo,
    mockWaiverRepo,
    mockPausedReminderRepo
  );
});

After({ tags: '@ValidateCreateCreditNoteUsecase' }, () => {
  mockCreditNoteRepo = null;
  mockInvoiceRepo = null;
  mockInvoiceItemRepo = null;
  mockTransactionRepo = null;
  mockCouponRepo = null;
  mockWaiverRepo = null;
  mockPausedReminderRepo = null;
  mockEditorRepo = null;
  mockErpReferenceRepo = null;
  usecase = null;
});

Given(
  /^I have an ACTIVE invoice with the id "([\w-]+)"/,
  async (testInvoiceId: string) => {
    const maybeTransaction = TransactionMap.toDomain({
      status: TransactionStatus.ACTIVE,
      deleted: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
    if (maybeTransaction.isLeft()) {
      throw maybeTransaction.value;
    }

    transaction = maybeTransaction.value;
    const maybeInvoice = InvoiceMap.toDomain({
      id: testInvoiceId,
      status: InvoiceStatus.ACTIVE,
      transactionId: transaction.transactionId.id.toString(),
      persistentReferenceNumber: 'test-number',
    });

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    invoice = maybeInvoice.value;

    const maybeInvoiceItem = InvoiceItemMap.toDomain({
      invoiceId: testInvoiceId,
      manuscriptId: 'test-manuscript',
      price: 1000,
      vat: 20,
    });
    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }
    const invoiceItem = maybeInvoiceItem.value;

    await mockTransactionRepo.save(transaction);
    await mockInvoiceRepo.save(invoice);
    await mockInvoiceItemRepo.save(invoiceItem);

    transaction.addInvoice(invoice);
  }
);

When(
  /^I try to create a credit note for id "([\w-]+)" with reason BAD_DEBT/,
  async (testInvoiceId: string) => {
    result = await usecase.execute(
      {
        invoiceId: testInvoiceId,
        reason: CreationReason.BAD_DEBT,
      },
      defaultContext
    );
  }
);

Then(/^the original invoice gets into final state/, async () => {
  invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
  expect(invoiceCollection[0].invoiceId.id.toString()).to.equal(
    invoice.id.toString()
  );
  expect(invoiceCollection[0].status).to.equal(InvoiceStatus.FINAL);
});

Then(/^the credit note should be created/, async () => {
  expect(result.isRight()).to.be.true;
  expect(result.value).to.not.be.null;
});
