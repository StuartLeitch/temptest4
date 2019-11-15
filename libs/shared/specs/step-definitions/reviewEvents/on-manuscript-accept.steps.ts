import { defineFeature, loadFeature } from 'jest-cucumber';

import { Roles } from '../../../src/lib/modules/users/domain/enums/Roles';

import { Invoice } from '../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceItem } from '../../../src/lib/modules/invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceMap } from './../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceItemMap } from './../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { CatalogItem } from './../../../src/lib/modules/journals/domain/CatalogItem';
import { Article } from '../../../src/lib/modules/manuscripts/domain/Article';
import { ArticleRepoContract } from '../../../src/lib/modules/manuscripts/repos/articleRepo';
import { MockArticleRepo } from '../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { CatalogMap } from './../../../src/lib/modules/journals/mappers/CatalogMap';
import { ArticleMap } from '../../../src/lib/modules/manuscripts/mappers/ArticleMap';
import { TransactionRepoContract } from './../../../src/lib/modules/transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from './../../../src/lib/modules/invoices/repos/invoiceItemRepo';
import { InvoiceRepoContract } from './../../../src/lib/modules/invoices/repos/invoiceRepo';
import { CatalogRepoContract } from './../../../src/lib/modules/journals/repos/catalogRepo';
import { WaiverRepoContract } from './../../../src/lib/domain/reductions/repos/waiverRepo';

import {
  UpdateTransactionContext,
  UpdateTransactionOnAcceptManuscriptUsecase
} from '../../../src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';

import {
  Transaction,
  STATUS as TransactionStatus
} from '../../../src/lib/modules/transactions/domain/Transaction';

import { TransactionMap } from './../../../src/lib/modules/transactions/mappers/TransactionMap';
import { MockTransactionRepo } from '../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

import { MockInvoiceRepo } from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockCatalogRepo } from '../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockInvoiceItemRepo } from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockWaiverRepo } from '../../../src/lib/domain/reductions/repos/mocks/mockWaiverRepo';
import { WaiverService } from '../../../src/lib/domain/services/WaiverService';

const feature = loadFeature(
  '../../features/reviewEvents/on-manuscript-accept.feature',
  { loadRelativePath: true }
);

const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

defineFeature(feature, test => {
  const mockTransactionRepo: TransactionRepoContract = new MockTransactionRepo();
  const mockInvoiceRepo: InvoiceRepoContract = new MockInvoiceRepo();
  const mockCatalogRepo: CatalogRepoContract = new MockCatalogRepo();
  const mockInvoiceItemRepo: InvoiceItemRepoContract = new MockInvoiceItemRepo();
  const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();
  const mockWaiverRepo: WaiverRepoContract = new MockWaiverRepo();
  const waiverService: WaiverService = new WaiverService();
  let result: any;

  const manuscriptId = 'manuscript-id';
  const journalId = 'journal-id';

  const usecase: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
    mockTransactionRepo,
    mockInvoiceItemRepo,
    mockInvoiceRepo,
    mockCatalogRepo,
    mockArticleRepo,
    mockWaiverRepo,
    waiverService
  );

  let transaction: Transaction;
  let invoice: Invoice;
  let invoiceItem: InvoiceItem;
  let catalogItem: CatalogItem;
  let manuscript: Article;

  beforeEach(() => {
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT,
      deleted: 0,
      dateCreated: new Date(),
      dateUpdated: new Date()
    });
    invoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId
    });
    invoiceItem = InvoiceItemMap.toDomain({
      manuscriptId,
      invoiceId: invoice.invoiceId.id.toString()
    });

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);
    mockInvoiceItemRepo.save(invoiceItem);
  });

  test('Manuscript Accept Handler', ({ given, when, then, and }) => {
    given('Invoicing listening to events emitted by Review', () => {});

    and('The APC Catalog Item has a price of 1900', () => {
      catalogItem = CatalogMap.toDomain({
        journalId,
        type: 'APC',
        price: 1900
      });
      mockCatalogRepo.save(catalogItem);
    });

    and('The Author is from a Waived Country', () => {
      const title = 'manuscript-title';
      const articleTypeId = 'article-type-id';
      const authorEmail = 'author@email.com';
      const authorCountry = 'MD';
      const authorSurname = 'Author Surname';

      manuscript = ArticleMap.toDomain({
        id: manuscriptId,
        title,
        articleTypeId,
        authorEmail,
        authorCountry,
        authorSurname
      });
      mockArticleRepo.save(manuscript);
    });

    when('A manuscript accept event is published', async () => {
      result = await usecase.execute(
        {
          manuscriptId,
          journalId
        },
        defaultContext
      );
    });

    then(
      'The Transaction associated with the manuscript should be ACTIVE',
      async () => {
        expect(result.value.isSuccess).toBe(true);

        const transactions = await mockTransactionRepo.getTransactionCollection();
        const [associatedTransaction] = transactions;

        expect(associatedTransaction.status).toEqual(TransactionStatus.ACTIVE);
      }
    );

    and(
      'The Invoice Item associated with the manuscript should have the price of 950',
      async () => {
        const invoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
        const [associatedInvoiceItem] = invoiceItems;

        expect(associatedInvoiceItem.price).toEqual(950);
      }
    );
  });
});
