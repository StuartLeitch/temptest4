import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/domain/authorization';

import { Invoice } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { Manuscript } from '../../../../../../src/lib/modules/manuscripts/domain/Manuscript';
import { RestoreSoftDeleteDraftTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/restoreSoftDeleteDraftTransaction/restoreSoftDeleteDraftTransaction';
import {
  Transaction,
  TransactionStatus,
} from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';

let invoice: Invoice;
let manuscript: Manuscript;
let transaction: Transaction;
let invoiceItem: InvoiceItem;

let manuscriptId;
let journalId;

let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockArticleRepo: MockArticleRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockInvoiceItemRepo: MockInvoiceItemRepo;
let usecase: RestoreSoftDeleteDraftTransactionUsecase;

let defaultContext: UsecaseAuthorizationContext;

Before(function () {
  mockTransactionRepo = new MockTransactionRepo();
  mockInvoiceRepo = new MockInvoiceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockArticleRepo = new MockArticleRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();

  defaultContext = {
    roles: [Roles.SUPER_ADMIN],
  };

  usecase = new RestoreSoftDeleteDraftTransactionUsecase(
    mockTransactionRepo,
    mockInvoiceItemRepo,
    mockArticleRepo,
    mockInvoiceRepo,
    mockCouponRepo,
    mockWaiverRepo
  );
});

Given(
  /^A resubmitted manuscript "([\w-]+)" on journal "([\w-]+)"$/,
  async function (manuscriptTestId: string, journalTestId: string) {
    journalId = journalTestId;
    manuscriptId = manuscriptTestId;

    manuscript = ArticleMap.toDomain({
      id: manuscriptId,
      journalId: journalId,
      customId: '1111',
    });

    mockArticleRepo.addMockItem(manuscript);
  }
);

Given(
  /^An Invoice with a DRAFT Transaction and an Invoice Item linked to the manuscript "([\w-]+)"$/,
  async function (manuscriptTestId: string) {
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT,
      deleted: 1,
    });

    invoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId.id.toString(),
    });

    invoiceItem = InvoiceItemMap.toDomain({
      manuscriptId: manuscriptTestId,
      invoiceId: invoice.invoiceId.id.toString(),
    });

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockTransactionRepo.addMockItem(transaction);
    mockInvoiceRepo.addMockItem(invoice);
    mockInvoiceItemRepo.addMockItem(invoiceItem);
  }
);

When(
  /^RestoreSoftDeleteDraftTransactionUsecase executes for manuscript "([\w-]+)"$/,
  async (manuscriptTestId: string) => {
    await usecase.execute(
      {
        manuscriptId: manuscriptTestId,
      },
      defaultContext
    );
  }
);

Then(
  'The DRAFT Transaction tied with the manuscript should be restored',
  async () => {
    const transactions = await mockTransactionRepo.getTransactionCollection();
    expect(transactions[0].props.deleted).to.equal(0);
  }
);

Then(
  'The DRAFT Invoice tied with the manuscript should be restored',
  async () => {
    const invoices = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoices.length).to.equal(1);
  }
);

Then(
  'The Invoice Item tied with the manuscript should be restored',
  async () => {
    const invoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
    expect(invoiceItems.length).to.equal(1);
  }
);
