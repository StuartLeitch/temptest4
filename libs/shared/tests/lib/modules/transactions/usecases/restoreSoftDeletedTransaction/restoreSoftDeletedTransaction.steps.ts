import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';

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

import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { ArticleRepoContract } from '../../../../../../src/lib/modules/manuscripts/repos/articleRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

const mockTransactionRepo: MockTransactionRepo = new MockTransactionRepo();
const mockInvoiceRepo: MockInvoiceRepo = new MockInvoiceRepo();
const mockInvoiceItemRepo: MockInvoiceItemRepo = new MockInvoiceItemRepo();
const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();

const usecase: RestoreSoftDeleteDraftTransactionUsecase = new RestoreSoftDeleteDraftTransactionUsecase(
  mockTransactionRepo,
  mockInvoiceItemRepo,
  mockInvoiceRepo,
  mockArticleRepo
);

let manuscriptId;
let journalId;

let result: any;
let transaction: Transaction;
let invoice: Invoice;
let invoiceItem: InvoiceItem;
let manuscript: Manuscript;

Given(
  /^The journal named "([\w-]+)" with the manuscript named "([\w-]+)"$/,
  async function (journalTestId: string, manuscriptTestId: string) {
    journalId = journalTestId;
    manuscriptId = manuscriptTestId;

    manuscript = ArticleMap.toDomain({
      id: manuscriptId,
      journalId: journalId,
    });

    mockArticleRepo.save(manuscript);
  }
);

Given(
  /^A Invoice in a DRAFT Transaction and a Invoice Item is linked to the manuscript "([\w-]+)"$/,
  async function (manuscriptTestId: string) {
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT,
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

    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);
    mockInvoiceItemRepo.save(invoiceItem);
  }
);

When(
  /^RestoreSoftDeleteDraftTransactionUsecase is executed for the manuscript "([\w-]+)"$/,
  async (manuscriptTestId: string) => {
    result = await usecase.execute(
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
    expect(result.value.isSuccess).to.equal(true);

    const transactions = await mockTransactionRepo.getTransactionCollection();
    expect(transactions.length).to.equal(1);
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
