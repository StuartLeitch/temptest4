import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../../src/lib/domain/authorization';

import { Invoice } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import { CatalogItem } from '../../../../../../src/lib/modules/journals/domain/CatalogItem';
import { Article } from '../../../../../../src/lib/modules/manuscripts/domain/Article';
import { Waiver } from '../../../../../../src/lib/modules/waivers/domain/Waiver';
import {
  Transaction,
  TransactionStatus,
} from '../../../../../../src/lib/modules/transactions/domain/Transaction';

import { ArticleRepoContract } from '../../../../../../src/lib/modules/manuscripts/repos/articleRepo';
import { TransactionRepoContract } from '../../../../../../src/lib/modules/transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../../../../src/lib/modules/invoices/repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../../../../../src/lib/modules/invoices/repos/invoiceRepo';
import { CatalogRepoContract } from '../../../../../../src/lib/modules/journals/repos/catalogRepo';
// import { WaiverRepoContract } from '../../../../../../src/lib/modules/waivers/repos/waiverRepo';
import { EditorRepoContract } from '../../../../../../src/lib/modules/journals/repos/editorRepo';
import { PayerRepoContract } from '../../../../../../src/lib/modules/payers/repos/payerRepo';
import { CouponRepoContract } from '../../../../../../src/lib/modules/coupons/repos/couponRepo';

import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { TransactionMap } from '../../../../../../src/lib/modules/transactions/mappers/TransactionMap';
import { CatalogMap } from '../../../../../../src/lib/modules/journals/mappers/CatalogMap';
import { ArticleMap } from '../../../../../../src/lib/modules/manuscripts/mappers/ArticleMap';
import { WaiverMap } from '../../../../../../src/lib/modules/waivers/mappers/WaiverMap';

import { MockTransactionRepo } from '../../../../../../src/lib/modules/transactions/repos/mocks/mockTransactionRepo';
import { MockArticleRepo } from '../../../../../../src/lib/modules/manuscripts/repos/mocks/mockArticleRepo';
import { MockInvoiceRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';
import { MockCatalogRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockCatalogRepo';
import { MockEditorRepo } from '../../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockInvoiceItemRepo } from '../../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockWaiverRepo } from '../../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';
import { MockCouponRepo } from '../../../../../../src/lib/modules/coupons/repos/mocks/mockCouponRepo';
import { MockPayerRepo } from '../../../../../../src/lib/modules/payers/repos/mocks/mockPayerRepo';
import { MockAddressRepo } from '../../../../../../src/lib/modules/addresses/repos/mocks/mockAddressRepo';

import { WaiverService } from '../../../../../../src/lib/domain/services/WaiverService';
import { EmailService } from '../../../../../../src/lib/infrastructure/communication-channels/EmailService';
import { VATService } from '../../../../../../src/lib/domain/services/VATService';

import { UpdateTransactionOnAcceptManuscriptUsecase } from '../../../../../../src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';
import { AddressRepoContract } from '../../../../../../src/lib/modules/addresses/repos/addressRepo';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

const mockTransactionRepo: TransactionRepoContract = new MockTransactionRepo();
const mockInvoiceRepo: InvoiceRepoContract = new MockInvoiceRepo();
const mockCatalogRepo: CatalogRepoContract = new MockCatalogRepo();
const mockInvoiceItemRepo: InvoiceItemRepoContract = new MockInvoiceItemRepo();
const mockArticleRepo: ArticleRepoContract = new MockArticleRepo();
const mockWaiverRepo = new MockWaiverRepo();
const mockEditorRepo: EditorRepoContract = new MockEditorRepo();
const mockAddressRepo: AddressRepoContract = new MockAddressRepo();
const mockPayerRepo: PayerRepoContract = new MockPayerRepo();
const mockCouponRepo: CouponRepoContract = new MockCouponRepo();

const waiverService: WaiverService = new WaiverService(
  mockWaiverRepo,
  mockEditorRepo
);
const emailService: EmailService = new EmailService(
  true,
  process.env.FE_ROOT,
  process.env.TENANT_NAME
);
const vatService: VATService = new VATService();
const loggerService: any = null;

const usecase: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
  mockAddressRepo,
  mockCatalogRepo,
  mockTransactionRepo,
  mockInvoiceItemRepo,
  mockInvoiceRepo,
  mockArticleRepo,
  mockWaiverRepo,
  mockPayerRepo,
  mockCouponRepo,
  waiverService,
  emailService,
  vatService,
  loggerService
);

let transaction: Transaction;
let invoice: Invoice;
let invoiceItem: InvoiceItem;
let catalogItem: CatalogItem;
let manuscript: Article;
let result: any;
let waiver: Waiver;

let manuscriptId;
let journalId;
let price;

// BeforeAll(function () {

// });

Given(
  /^A Journal "([\w-]+)" with the APC price of (\d+)$/,
  async (journalTestId: string, priceTest: number) => {
    journalId = journalTestId;
    price = priceTest;
    catalogItem = CatalogMap.toDomain({
      journalId,
      type: 'APC',
      amount: price,
    });
    mockCatalogRepo.save(catalogItem);
  }
);

Given(
  /^A manuscript "([\w-]+)" which passed the review process$/,
  async function (manuscriptTestId: string) {
    const title = 'manuscript-title';
    const articleTypeId = 'article-type-id';
    const authorEmail = 'author@email.com';
    const authorSurname = 'Author Surname';

    manuscriptId = manuscriptTestId;
    manuscript = ArticleMap.toDomain({
      id: manuscriptId,
      title,
      articleTypeId,
      authorEmail,
      authorSurname,
      journalId: journalId,
    });
    mockArticleRepo.save(manuscript);

    transaction = TransactionMap.toDomain({
      status: TransactionStatus.DRAFT,
      deleted: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    });
    invoice = InvoiceMap.toDomain({
      status: InvoiceStatus.DRAFT,
      transactionId: transaction.transactionId.id.toString(),
    });
    invoiceItem = InvoiceItemMap.toDomain({
      manuscriptId,
      invoiceId: invoice.invoiceId.id.toString(),
      price: price,
    });
    waiver = WaiverMap.toDomain({
      type_id: 'WAIVED_COUNTRY',
      reduction: 100,
      isActive: true,
    });

    invoice.addInvoiceItem(invoiceItem);
    transaction.addInvoice(invoice);

    mockWaiverRepo.save(waiver);
    mockTransactionRepo.save(transaction);
    mockInvoiceRepo.save(invoice);
    mockInvoiceItemRepo.save(invoiceItem);
  }
);

When(
  /^UpdateTransactionOnAcceptManuscriptUsecase is executed for manuscript "([\w-]+)"$/,
  async function (manuscriptTestId: string) {
    result = await usecase.execute(
      {
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

Then(
  'The Transaction associated with the manuscript should be ACTIVE',
  async () => {
    expect(result.value.isSuccess).to.equal(true);

    const transactions = await mockTransactionRepo.getTransactionCollection();
    const [associatedTransaction] = transactions;
    expect(associatedTransaction.status).to.equal(TransactionStatus.ACTIVE);
  }
);

Then(
  'The Invoice Item associated with the manuscript should have the price of {int}',
  async (finalPrice: number) => {
    const invoiceItems = await mockInvoiceItemRepo.getInvoiceItemCollection();
    const [associatedInvoiceItem] = invoiceItems;
    expect(associatedInvoiceItem.price).to.equal(finalPrice);
  }
);
