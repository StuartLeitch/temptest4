import { expect } from 'chai';
import { Given, When, Then } from '@cucumber/cucumber';

import { Roles, UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';

import { Invoice } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { CatalogItem } from '../../../../../../src/lib/modules/journals/domain/CatalogItem';
import { Article } from '../../../../../../src/lib/modules/manuscripts/domain/Article';
import { Waiver } from '../../../../../../src/lib/modules/waivers/domain/Waiver';
import { Transaction, TransactionStatus } from '../../../../../../src/lib/modules/transactions/domain/Transaction';

import { TransactionRepoContract } from '../../../../../../src/lib/modules/transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../../../../src/lib/modules/invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../../../../src/lib/modules/manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../../../../src/lib/modules/addresses/repos/addressRepo';
import { InvoiceRepoContract } from '../../../../../../src/lib/modules/invoices/repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../../../src/lib/modules/journals/repos/catalogRepo';
import { EditorRepoContract } from '../../../../../../src/lib/modules/journals/repos/editorRepo';
import { CouponRepoContract } from '../../../../../../src/lib/modules/coupons/repos/couponRepo';
import { PayerRepoContract } from '../../../../../../src/lib/modules/payers/repos/payerRepo';
import { WaiverRepoContract } from '../../../../../../src/lib/modules/waivers/repos';

import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';
import { CatalogMap } from '../../../../../../src/lib/modules/journals/mappers/CatalogMap';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { WaiverMap } from '../../../../../../src/lib/modules/waivers/mappers/WaiverMap';

import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockEditorRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';

import { EmailService } from '../../../../../../src/lib/infrastructure/communication-channels/index';
import { WaiverService } from '../../../../../../src/lib/domain/services/WaiverService';
import { VATService } from '../../../../../../src/lib/domain/services/VATService';

import {
  UpdateTransactionOnAcceptManuscriptUsecase,
  UpdateTransactionOnAcceptManuscriptResponse,
} from '../../../../../../src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript';
import { LoggerContract, MockLogger } from '../../../../../../src/lib/infrastructure/logging';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

const mockTransactionRepo: TransactionRepoContract = new MockTransactionRepo();
const mockInvoiceRepo: InvoiceRepoContract = new MockInvoiceRepo();
const mockCatalogRepo: CatalogRepoContract = new MockCatalogRepo();
const mockInvoiceItemRepo: InvoiceItemRepoContract = new MockInvoiceItemRepo();
const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();
const mockWaiverRepo: WaiverRepoContract = new MockWaiverRepo();
const mockEditorRepo: EditorRepoContract = new MockEditorRepo();
const mockAddressRepo: AddressRepoContract = new MockAddressRepo();
const mockPayerRepo: PayerRepoContract = new MockPayerRepo();
const mockCouponRepo: CouponRepoContract = new MockCouponRepo();

const waiverService: WaiverService = new WaiverService(mockInvoiceItemRepo, mockEditorRepo, mockWaiverRepo);
const emailService: EmailService = new EmailService(true, process.env.FE_ROOT, process.env.TENANT_NAME, '', '');
const vatService: VATService = new VATService();
const loggerService: LoggerContract = new MockLogger();

const usecase: UpdateTransactionOnAcceptManuscriptUsecase =
  new UpdateTransactionOnAcceptManuscriptUsecase(
    mockAddressRepo,
    mockCatalogRepo,
    mockTransactionRepo,
    mockInvoiceItemRepo,
    mockInvoiceRepo,
    mockArticleRepo,
    mockWaiverRepo,
  waiverService,
    mockPayerRepo,
    mockCouponRepo,
    emailService,
    vatService,
    loggerService
  );

let result: UpdateTransactionOnAcceptManuscriptResponse;
let transaction: Transaction;
let invoiceItem: InvoiceItem;
let catalogItem: CatalogItem;
let manuscript: Article;
let invoice: Invoice;
let waiver: Waiver;

let manuscriptId;
let journalId;
let price;

Given(/^A Journal "([\w-]+)" with the APC price of (\d+)$/, async (journalTestId: string, priceTest: number) => {
  journalId = journalTestId;
  price = priceTest;
  const maybeCatalogItem = CatalogMap.toDomain({
    journalId,
    type: 'APC',
    amount: price,
  });

  if (maybeCatalogItem.isLeft()) {
    throw maybeCatalogItem.value;
  }

  catalogItem = maybeCatalogItem.value;

  mockCatalogRepo.save(catalogItem);
});

Given(/^A manuscript "([\w-]+)" which passed the review process$/, async function (manuscriptTestId: string) {
  const title = 'manuscript-title';
  const articleTypeId = 'article-type-id';
  const authorEmail = 'author@email.com';
  const authorSurname = 'Author Surname';

  manuscriptId = manuscriptTestId;
  const maybeManuscript = ArticleMap.toDomain({
    id: manuscriptId,
    title,
    articleTypeId,
    authorEmail,
    authorSurname,
    journalId: journalId,
  });

  if (maybeManuscript.isLeft()) {
    throw maybeManuscript.value;
  }

  manuscript = maybeManuscript.value;

  mockArticleRepo.save(manuscript);

  const maybeTransaction = TransactionMap.toDomain({
    status: TransactionStatus.DRAFT,
    deleted: 0,
    dateCreated: new Date(),
    dateUpdated: new Date(),
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
    manuscriptId,
    invoiceId: invoice.invoiceId.id.toString(),
    price: price,
  });
  if (maybeInvoiceItem.isLeft()) {
    throw maybeInvoiceItem.value;
  }

  invoiceItem = maybeInvoiceItem.value;

  const maybeWaiver = WaiverMap.toDomain({
    type_id: 'WAIVED_COUNTRY',
    reduction: 100,
    isActive: true,
  });

  if (maybeWaiver.isLeft()) {
    throw maybeWaiver.value;
  }

  waiver = maybeWaiver.value;

  invoice.addInvoiceItem(invoiceItem);
  transaction.addInvoice(invoice);

  mockWaiverRepo.save(waiver);
  mockTransactionRepo.save(transaction);
  mockInvoiceRepo.save(invoice);
  mockInvoiceItemRepo.save(invoiceItem);
});

When(
  /^UpdateTransactionOnAcceptManuscriptUsecase is executed for manuscript "([\w-]+)"$/,
  async function (manuscriptTestId: string) {
    result = await usecase.execute(
      {
        authorsEmails: ['test'],
        manuscriptId: manuscriptTestId,
        confirmationReminder: {
          queueName: 'test',
          delay: 0.001,
        },
        emailSenderInfo: {
          address: manuscript.authorEmail,
          name: manuscript.authorSurname,
        },
      },
      defaultContext
    );
  }
);

Then('The Transaction associated with the manuscript should be ACTIVE', async () => {
  expect(result.isRight()).to.equal(true);

  const transactions = await mockTransactionRepo.getTransactionCollection();
  const maybeAssociatedTransactions = transactions;

  if (maybeAssociatedTransactions.isLeft()) {
    throw maybeAssociatedTransactions.value;
  }

  const [associatedTransaction] = maybeAssociatedTransactions.value;
  expect(associatedTransaction.status).to.equal(TransactionStatus.ACTIVE);
});

Then('The Invoice Item associated with the manuscript should have the price of {int}', async (finalPrice: number) => {
  const maybeInvoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
      await mockInvoiceItemRepo.getInvoiceItemCollection();

  if (maybeInvoiceItems.isLeft()) {
    throw maybeInvoiceItems.value;
  }

  const invoiceItems = maybeInvoiceItems.value;

  const [associatedInvoiceItem] = invoiceItems;
  expect(associatedInvoiceItem.price).to.equal(finalPrice);
});
