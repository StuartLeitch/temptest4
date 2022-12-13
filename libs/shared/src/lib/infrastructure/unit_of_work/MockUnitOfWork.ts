import { VError } from 'verror';

import { TransactionType, WorkFunction, WorkOptions, UnitOfWork } from './UnitOfWork';
import { retryWork } from '../../core/logic/Retry';

import { CatalogRepoContract, EditorRepoContract, MockCatalogRepo, MockEditorRepo } from '../../modules/journals/repos';
import { PausedReminderRepoContract, MockPausedReminderRepo } from '../../modules/notifications/repos';
import { TransactionRepoContract, MockTransactionRepo } from '../../modules/transactions/repos';
import { CreditNoteRepoContract, MockCreditNoteRepo } from '../../modules/creditNotes/repos';
import { ErpReferenceRepoContract, MockErpReferenceRepo } from '../../modules/vendors/repos';
import { PublisherRepoContract, MockPublisherRepo } from '../../modules/publishers/repos';
import { ArticleRepoContract, MockArticleRepo } from '../../modules/manuscripts/repos';
import { AddressRepoContract, MockAddressRepo } from '../../modules/addresses/repos';
import { CouponRepoContract, MockCouponRepo } from '../../modules/coupons/repos';
import { WaiverRepoContract, MockWaiverRepo } from '../../modules/waivers/repos';
import { PayerRepoContract, MockPayerRepo } from '../../modules/payers/repos';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
  MockInvoiceItemRepo,
  MockInvoiceRepo,
} from '../../modules/invoices/repos';
import {
  PaymentMethodRepoContract,
  MockPaymentMethodRepo,
  PaymentRepoContract,
  MockPaymentRepo,
} from '../../modules/payments/repos';

type MockRepos = {
  pausedReminderRepo: PausedReminderRepoContract;
  paymentMethodRepo: PaymentMethodRepoContract;
  erpReferenceRepo: ErpReferenceRepoContract;
  invoiceItemsRepo: InvoiceItemRepoContract;
  transactionRepo: TransactionRepoContract;
  creditNoteRepo: CreditNoteRepoContract;
  publisherRepo: PublisherRepoContract;
  addressRepo: AddressRepoContract;
  articleRepo: ArticleRepoContract;
  catalogRepo: CatalogRepoContract;
  invoiceRepo: InvoiceRepoContract;
  paymentRepo: PaymentRepoContract;
  waiverRepo: WaiverRepoContract;
  editorRepo: EditorRepoContract;
  couponRepo: CouponRepoContract;
  payerRepo: PayerRepoContract;
};

const defaultOptions: WorkOptions = {
  transactionType: TransactionType.ReadCommitted,
};

export class MockUnitOfWork implements UnitOfWork<MockRepos> {
  private options: WorkOptions | null = null;
  private repos: MockRepos | null = null;

  constructor() {}

  async start(options: WorkOptions = defaultOptions): Promise<void> {
    this.options = options;

    this.repos = createRepos();
  }

  async work(workFunction: WorkFunction<MockRepos>): Promise<void> {
    if (!this.options || !this.repos) {
      throw new VError('The start method must be called before work is started');
    }

    const doWork = async () => {
      await workFunction(this.repos);
    };

    try {
      await retryWork(doWork);
    } catch (err) {
      throw new VError('Work failed', err);
    }
  }
}

function createRepos(): MockRepos {
  const pausedReminderRepo = new MockPausedReminderRepo();
  const paymentMethodRepo = new MockPaymentMethodRepo();
  const erpReferenceRepo = new MockErpReferenceRepo();
  const invoiceItemsRepo = new MockInvoiceItemRepo();
  const transactionRepo = new MockTransactionRepo();
  const creditNoteRepo = new MockCreditNoteRepo();
  const publisherRepo = new MockPublisherRepo();
  const articleRepo = new MockArticleRepo();
  const invoiceRepo = new MockInvoiceRepo();
  const addressRepo = new MockAddressRepo();
  const catalogRepo = new MockCatalogRepo();
  const paymentRepo = new MockPaymentRepo();
  const couponRepo = new MockCouponRepo();
  const editorRepo = new MockEditorRepo();
  const waiverRepo = new MockWaiverRepo();
  const payerRepo = new MockPayerRepo();

  return {
    pausedReminderRepo,
    paymentMethodRepo,
    erpReferenceRepo,
    invoiceItemsRepo,
    transactionRepo,
    creditNoteRepo,
    publisherRepo,
    addressRepo,
    articleRepo,
    catalogRepo,
    invoiceRepo,
    paymentRepo,
    waiverRepo,
    editorRepo,
    couponRepo,
    payerRepo,
  };
}
