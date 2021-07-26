import { expect } from 'chai';
import { Given, When, Then } from '@cucumber/cucumber';

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
import { SoftDeleteDraftTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';
import {
  Transaction,
  TransactionStatus,
} from '../../../../../../src/lib/modules/transactions/domain/Transaction';
import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { ArticleRepoContract } from '../../../../../../src/lib/modules/manuscripts/repos/articleRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

const mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
const mockInvoiceItemRepo: MockInvoiceItemRepo = new MockInvoiceItemRepo();
const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();

const usecase: SoftDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
  mockTransactionRepo,
  mockInvoiceItemRepo,
  mockInvoiceRepo,
  mockArticleRepo
);

let manuscriptId;
let journalId;

let transaction: Transaction;
let invoice: Invoice;
let invoiceItem: InvoiceItem;
let manuscript: Manuscript;

Given(
  /^A journal "([\w-]+)" with a manuscript "([\w-]+)"$/,
  async function (journalTestId: string, manuscriptTestId: string) {
    journalId = journalTestId;
    manuscriptId = manuscriptTestId;

    const maybeManuscript = ArticleMap.toDomain({
      id: manuscriptId,
      journalId: journalId,
    });

    if (maybeManuscript.isLeft()) {
      throw maybeManuscript.value;
    }

    manuscript = maybeManuscript.value;

    mockArticleRepo.save(manuscript);
  }
);

Given(
  /^A Invoice with a DRAFT Transaction and a Invoice Item tied to the manuscript "([\w-]+)"$/,
  async function (manuscriptTestId: string) {
    const maybeTransaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT,
    });

    if (maybeTransaction.isLeft()) {
      throw maybeTransaction.value;
    }

    transaction = maybeTransaction.value;

    const maybeInvoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId.id.toString(),
    });

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    invoice = maybeInvoice.value;

    const maybeInvoiceItem = InvoiceItemMap.toDomain({
      manuscriptId: manuscriptTestId,
      invoiceId: invoice.invoiceId.id.toString(),
    });

    if (maybeInvoiceItem.isLeft()) {
      throw maybeInvoiceItem.value;
    }

    invoiceItem = maybeInvoiceItem.value;

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);
    mockInvoiceItemRepo.save(invoiceItem);
  }
);

When(
  /^SoftDeleteDraftTransactionUsecase is executed for manuscript "([\w-]+)"$/,
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
  'The DRAFT Transaction associated with the manuscript should be soft deleted',
  async () => {
    expect(mockTransactionRepo.deletedItems.length).to.equal(1);
  }
);

Then(
  'The DRAFT Invoice associated with the manuscript should be soft deleted',
  async () => {
    expect(mockInvoiceRepo.deletedItems.length).to.equal(1);
  }
);

Then(
  'The Invoice Item associated with the manuscript should be soft deleted',
  async () => {
    expect(mockInvoiceItemRepo.deletedItems.length).to.equal(1);
  }
);
