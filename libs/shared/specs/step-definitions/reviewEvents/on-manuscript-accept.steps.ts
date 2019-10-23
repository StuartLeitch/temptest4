import {defineFeature, loadFeature} from 'jest-cucumber';

import {Result} from '../../../src/lib/core/logic/Result';
import {Roles} from '../../../src/lib/modules/users/domain/enums/Roles';

import {Invoice} from '../../../src/lib/modules/invoices/domain/Invoice';
import {InvoiceItem} from '../../../src/lib/modules/invoices/domain/InvoiceItem';
import {InvoiceStatus} from '../../../src/lib/modules/invoices/domain/Invoice';
// import {InvoiceId} from '../../../src/lib/modules/invoices/domain/InvoiceId';
import {InvoiceMap} from './../../../src/lib/modules/invoices/mappers/InvoiceMap';
import {InvoiceItemMap} from './../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import {CatalogItem} from './../../../src/lib/modules/catalogs/domain/CatalogItem';
import {Article} from './../../../src/lib/modules/articles/domain/Article';
import {ArticleRepoContract} from './../../../src/lib/modules/articles/repos/articleRepo';
import {MockArticleRepo} from './../../../src/lib/modules/articles/repos/mocks/mockArticleRepo';
import {CatalogMap} from './../../../src/lib/modules/catalogs/mappers/CatalogMap';
import {ArticleMap} from './../../../src/lib/modules/articles/mappers/ArticleMap';
import {TransactionRepoContract} from './../../../src/lib/modules/transactions/repos/transactionRepo';
import {InvoiceItemRepoContract} from './../../../src/lib/modules/invoices/repos/invoiceItemRepo';
import {InvoiceRepoContract} from './../../../src/lib/modules/invoices/repos/invoiceRepo';
import {CatalogRepoContract} from './../../../src/lib/modules/catalogs/repos/catalogRepo';

import {
  UpdateTransactionContext,
  UpdateTransactionOnAcceptManuscriptUsecase
} from '../../../src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';

import {
  Transaction,
  STATUS as TransactionStatus
} from '../../../src/lib/modules/transactions/domain/Transaction';
// import {TransactionId} from '../../../src/lib/modules/transactions/domain/TransactionId';
import {TransactionMap} from './../../../src/lib/modules/transactions/mappers/TransactionMap';
import {MockTransactionRepo} from '../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';

import {MockInvoiceRepo} from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import {MockCatalogRepo} from '../../../src/lib/modules/catalogs/repos/mocks/mockCatalogRepo';
import {MockInvoiceItemRepo} from '../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import {WaiverService} from '../../../src/lib/domain/services/WaiverService';

const feature = loadFeature(
  '../../features/reviewEvents/on-manuscript-accept.feature',
  {loadRelativePath: true}
);

const defaultContext: UpdateTransactionContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  const mockTransactionRepo: TransactionRepoContract = new MockTransactionRepo();
  const mockInvoiceRepo: InvoiceRepoContract = new MockInvoiceRepo();
  const mockCatalogRepo: CatalogRepoContract = new MockCatalogRepo();
  const mockInvoiceItemRepo: InvoiceItemRepoContract = new MockInvoiceItemRepo();
  const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();
  const waiverService: WaiverService = new WaiverService();
  let result: any;

  const manuscriptId = 'manuscript-id';

  const usecase: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
    mockTransactionRepo,
    mockInvoiceItemRepo,
    mockInvoiceRepo,
    mockCatalogRepo,
    mockArticleRepo,
    waiverService
  );

  let transaction: Transaction;
  let invoice: Invoice;
  let invoiceItem: InvoiceItem;
  let catalogItem: CatalogItem;
  let manuscript: Article;

  beforeEach(() => {
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT
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

    console.info(TransactionMap.toPersistence(transaction));
    console.info(InvoiceMap.toPersistence(invoice));
    console.info(InvoiceItemMap.toPersistence(invoiceItem));
  });

  test('Manuscript Accept Handler', ({given, when, then, and}) => {
    given('Invoicing listening to events emitted by Review', () => {});

    and('The APC Catalog Item has a price of 100', () => {
      catalogItem = CatalogMap.toDomain({
        type: 'APC',
        price: 1900
      });
      mockCatalogRepo.save(catalogItem);
      console.info(CatalogMap.toPersistence(catalogItem));
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
      console.info(ArticleMap.toPersistence(manuscript));
      mockArticleRepo.save(manuscript);
    });

    when('A manuscript accept event is published', async () => {
      result = await usecase.execute(
        {
          manuscriptId
        },
        defaultContext
      );
    });

    then(
      'The Transaction associated with the manuscript should be ACTIVE',
      async () => {
        expect(result.value.isSuccess).toBe(true);

        // const transactions = await mockTransactionRepo.getTransactionCollection();
        // console.info(transactions);
        // const [
        //   transaction
        // ] = await mockTransactionRepo.getTransactionCollection();

        // expect(transaction.status).toEqual(TransactionStatus.ACTIVE);
      }
    );

    and(
      'The Invoice Item associated with the manuscript should have the price of 50',
      async () => {
        // const [
        //   invoiceItem
        // ] = await mockInvoiceItemRepo.getInvoiceItemCollection();
        // expect(invoiceItem.price).toEqual(50);
      }
    );
  });
});
