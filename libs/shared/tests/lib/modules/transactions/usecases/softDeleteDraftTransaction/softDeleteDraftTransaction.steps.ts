import { expect } from 'chai';
import { Given, When, Then, BeforeAll } from 'cucumber';

import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';

import { Invoice } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { Manuscript } from '../../../../../../src/lib/modules/manuscripts/domain/Manuscript';
import { SoftDeleteDraftTransactionUsecase } from '../../../../../../src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';
import { DeleteTransactionContext } from '../../../../../../src/lib/modules/transactions/usecases/deleteTransaction/deleteTransaction';
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

const defaultContext: DeleteTransactionContext = { roles: [Roles.SUPER_ADMIN] };

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

const manuscriptId = 'manuscript-id';

let result: any;
let transaction: Transaction;
let invoice: Invoice;
let invoiceItem: InvoiceItem;
let manuscript: Manuscript;

BeforeAll(function () {
  transaction = TransactionMap.toDomain({
    status: TransactionStatus.DRAFT,
  });
  invoice = InvoiceMap.toDomain({
    status: InvoiceStatus.DRAFT,
    transactionId: transaction.transactionId.id.toString(),
  });
  invoiceItem = InvoiceItemMap.toDomain({
    manuscriptId,
    invoiceId: invoice.invoiceId.id.toString(),
  });

  invoice.addInvoiceItem(invoiceItem);
  transaction.addInvoice(invoice);

  mockTransactionRepo.save(transaction);
  mockInvoiceRepo.save(invoice);
  mockInvoiceItemRepo.save(invoiceItem);

  const title = 'manuscript-title1';
  const articleTypeId = 'article-type-id';
  const authorEmail = 'author@email.com';
  const authorSurname = 'Author Surname';
  const journalId = 'journal-id1';

  manuscript = ArticleMap.toDomain({
    id: manuscriptId,
    title,
    articleTypeId,
    authorEmail,
    authorSurname,
    journalId: journalId,
  });

  mockArticleRepo.save(manuscript);
});

Given(
  'Invoicing listening to reject events emitted by Review',
  async function () {
    return;
  }
);

When('A manuscript reject event is published', async () => {
  result = await usecase.execute(
    {
      manuscriptId,
    },
    defaultContext
  );
});

Then(
  'The DRAFT Transaction associated with the manuscript should be soft deleted',
  async () => {
    expect(result.value.isSuccess).to.equal(true);

    const transactions = await mockTransactionRepo.getTransactionCollection();
    expect(transactions.length).to.equal(0);
  }
);

Then(
  'The DRAFT Invoice associated with the manuscript should be soft deleted',
  async () => {
    const invoices = await mockInvoiceRepo.getInvoiceCollection();
    expect(invoices.length).to.equal(0);
  }
);

Then(
  'The Invoice Item associated with the manuscript should be soft deleted',
  async () => {
    const invoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
    expect(invoiceItems.length).to.equal(0);
  }
);
