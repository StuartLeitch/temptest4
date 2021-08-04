import { Before, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';

import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../src/lib/domain/authorization';

import { TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { Manuscript } from '../../../../../../src/lib/modules/manuscripts/domain/Manuscript';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';

import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';

import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

import { RestoreSoftDeleteDraftTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/restoreSoftDeleteDraftTransaction/restoreSoftDeleteDraftTransaction';
import { SoftDeleteDraftTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';

let manuscript: Manuscript;

let mockInvoiceItemRepo: MockInvoiceItemRepo;
let mockTransactionRepo: MockTransactionRepo;
let mockArticleRepo: MockArticleRepo;
let mockInvoiceRepo: MockInvoiceRepo;
let mockCouponRepo: MockCouponRepo;
let mockWaiverRepo: MockWaiverRepo;

let usecase: RestoreSoftDeleteDraftTransactionUsecase;

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

Before({ tags: '@ValidateRestoreSoftDeleteTransaction' }, function () {
  mockTransactionRepo = new MockTransactionRepo();
  mockInvoiceRepo = new MockInvoiceRepo();
  mockInvoiceItemRepo = new MockInvoiceItemRepo();
  mockArticleRepo = new MockArticleRepo();
  mockCouponRepo = new MockCouponRepo();
  mockWaiverRepo = new MockWaiverRepo();

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
  async function (manuscriptId: string, journalId: string) {
    const maybeManuscript = ArticleMap.toDomain({
      id: manuscriptId,
      journalId: journalId,
      customId: '1111',
    });

    if (maybeManuscript.isLeft()) {
      throw maybeManuscript.value;
    }

    manuscript = maybeManuscript.value;

    mockArticleRepo.addMockItem(manuscript);
  }
);

Given(
  /^An Invoice with a DRAFT Transaction and an Invoice Item linked to the manuscript "([\w-]+)"$/,
  async function (manuscriptTestId: string) {
    const maybeTransaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT,
      deleted: 1,
    });

    if (maybeTransaction.isLeft()) {
      throw maybeTransaction.value;
    }

    const transaction = maybeTransaction.value;

    const maybeInvoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId.id.toString(),
    });

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    const invoice = maybeInvoice.value;

    const maybeInvoiceItem = InvoiceItemMap.toDomain({
      manuscriptId: manuscriptTestId,
      invoiceId: invoice.invoiceId.id.toString(),
    });

    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }

    const invoiceItem = maybeInvoiceItem.value;

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockTransactionRepo.addMockItem(transaction);
    mockInvoiceRepo.addMockItem(invoice);
    mockInvoiceItemRepo.addMockItem(invoiceItem);
  }
);

Given(
  /^The manuscript with id "([\w-]+)" is withdrawn$/,
  async (manuscriptId: string) => {
    const usecase = new SoftDeleteDraftTransactionUsecase(
      mockTransactionRepo,
      mockInvoiceItemRepo,
      mockInvoiceRepo,
      mockArticleRepo
    );

    const maybeDelete = await usecase.execute({ manuscriptId }, defaultContext);

    if (maybeDelete.isLeft()) {
      throw maybeDelete.value;
    }
  }
);

When(
  /^RestoreSoftDeleteDraftTransactionUsecase executes for manuscript "([\w-]+)"$/,
  async (manuscriptTestId: string) => {
    const maybeResult = await usecase.execute(
      {
        manuscriptId: manuscriptTestId,
      },
      defaultContext
    );
    if (maybeResult.isLeft()) {
      throw maybeResult.value;
    }
  }
);

Then(
  'The DRAFT Transaction tied with the manuscript should be restored',
  async () => {
    expect(mockTransactionRepo.deletedItems.length).to.equal(0);
  }
);

Then(
  'The DRAFT Invoice tied with the manuscript should be restored',
  async () => {
    expect(mockInvoiceRepo.deletedItems.length).to.equal(0);
  }
);

Then(
  'The Invoice Item tied with the manuscript should be restored',
  async () => {
    expect(mockInvoiceItemRepo.deletedItems.length).to.equal(0);
  }
);

Then('The Manuscript should be restored', async () => {
  expect(mockArticleRepo.deletedItems.length).to.equal(0);
});
