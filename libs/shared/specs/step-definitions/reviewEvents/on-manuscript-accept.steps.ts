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
import {WaiverService} from './../../../src/lib/modules/invoices/domain/services/WaiverService';

const feature = loadFeature(
  '../../features/reviewEvents/on-manuscript-accept.feature',
  {loadRelativePath: true}
);

const defaultContext: UpdateTransactionContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  let mockTransactionRepo: TransactionRepoContract = new MockTransactionRepo();
  let mockInvoiceRepo: InvoiceRepoContract = new MockInvoiceRepo();
  let mockCatalogRepo: CatalogRepoContract = new MockCatalogRepo();
  let mockInvoiceItemRepo: InvoiceItemRepoContract = new MockInvoiceItemRepo();
  let mockArticleRepo: ArticleRepoContract = new MockArticleRepo();
  let waiverService: WaiverService = new WaiverService();
  let result: any;

  let manuscriptId = 'manuscript-id';
  let title = 'manuscript-title';
  let articleTypeId = 'article-type-id';
  let authorEmail = 'author@email.com';
  let authorCountry = 'MD';
  let authorSurname = 'Author Surname';

  let usecase: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
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
    manuscript = ArticleMap.toDomain({
      id: manuscriptId,
      title,
      articleTypeId,
      authorEmail,
      authorCountry,
      authorSurname
    });
    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT
    });
    invoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId
    });
    catalogItem = CatalogMap.toDomain({
      type: 'APC',
      price: 1900
    });
    invoiceItem = InvoiceItemMap.toDomain({
      manuscriptId,
      invoiceId: invoice.invoiceId.id.toString()
    });

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockCatalogRepo.save(catalogItem);
    mockArticleRepo.save(manuscript);
    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);
    mockInvoiceItemRepo.save(invoiceItem);
  });

  test('Manuscript Accept Handler', ({given, when, then, and}) => {
    given('Invoicing listening to events emitted by Review', () => {});

    // and('The APC Catalog Item has a price of 100', () => {});
    // and('The Author is from a Waived Country', () => {});

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
        // const lastSavedTransactions = await mockTransactionRepo.getTransactionCollection();
        // expect(lastSavedTransactions.length).toEqual(1);
        // expect(lastSavedTransactions[0].status).toEqual(
        //   TransactionStatus.DRAFT
        // );
        // transactionId = lastSavedTransactions[0].transactionId;
      }
    );

    // and(
    //   'The DRAFT Invoice associated with the manuscript should have waivers applied',
    //   async () => {
    //     const lastSavedInvoices = await mockInvoiceRepo.getInvoiceCollection();
    //     expect(lastSavedInvoices.length).toEqual(1);
    //     expect(lastSavedInvoices[0].status).toEqual(InvoiceStatus.DRAFT);
    //     expect(lastSavedInvoices[0].transactionId.id.toString()).toEqual(
    //       transactionId.id.toString()
    //     );
    //     invoiceId = lastSavedInvoices[0].invoiceId;
    //   }
    // );

    // and(
    //   'The Invoice Item associated with the manuscript should have waivers applied',
    //   async () => {
    //     const lastSavedInvoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
    //     expect(lastSavedInvoiceItems.length).toEqual(1);
    //     expect(lastSavedInvoiceItems[0].invoiceId.id.toString()).toEqual(
    //       invoiceId.id.toString()
    //     );
    //   }
    // );
  });
});
