import { VError } from 'verror';

import { TransactionType, WorkFunction, WorkOptions, UnitOfWork } from './UnitOfWork';
import { LoggerBuilderContract } from '../logging';
import { retryWork } from '../../core/logic/Retry';
import { Knex } from '../database/knex';

import { CatalogRepoContract, EditorRepoContract, KnexCatalogRepo, KnexEditorRepo } from '../../modules/journals/repos';
import { TransactionRepoContract, KnexTransactionRepo } from '../../modules/transactions/repos';
import { ExchangeRateRepoContract, KnexExchangeRepo } from '../../modules/exchange-rate/repos';
import { CreditNoteRepoContract, KnexCreditNoteRepo } from '../../modules/creditNotes/repos';
import { ErpReferenceRepoContract, KnexErpReferenceRepo } from '../../modules/vendors/repos';
import { PublisherRepoContract, KnexPublisherRepo } from '../../modules/publishers/repos';
import { ArticleRepoContract, KnexArticleRepo } from '../../modules/manuscripts/repos';
import { AddressRepoContract, KnexAddressRepo } from '../../modules/addresses/repos';
import { AuditLogRepoContract, KnexAuditLogRepo } from '../../modules/audit/repos';
import { CouponRepoContract, KnexCouponRepo } from '../../modules/coupons/repos';
import { WaiverRepoContract, KnexWaiverRepo } from '../../modules/waivers/repos';
import { PayerRepoContract, KnexPayerRepo } from '../../modules/payers/repos';
import {
  InvoiceItemRepoContract,
  InvoiceRepoContract,
  KnexInvoiceItemRepo,
  KnexInvoiceRepo,
} from '../../modules/invoices/repos';
import {
  SentNotificationRepoContract,
  PausedReminderRepoContract,
  KnexSentNotificationsRepo,
  KnexPausedReminderRepo,
} from '../../modules/notifications/repos';
import {
  PaymentMethodRepoContract,
  KnexPaymentMethodRepo,
  PaymentRepoContract,
  KnexPaymentRepo,
} from '../../modules/payments/repos';

type KnexRepos = {
  sentNotificationsRepo: SentNotificationRepoContract;
  pausedReminderRepo: PausedReminderRepoContract;
  paymentMethodRepo: PaymentMethodRepoContract;
  erpReferenceRepo: ErpReferenceRepoContract;
  exchangeRateRepo: ExchangeRateRepoContract;
  invoiceItemsRepo: InvoiceItemRepoContract;
  transactionRepo: TransactionRepoContract;
  creditNoteRepo: CreditNoteRepoContract;
  publisherRepo: PublisherRepoContract;
  addressRepo: AddressRepoContract;
  articleRepo: ArticleRepoContract;
  catalogRepo: CatalogRepoContract;
  invoiceRepo: InvoiceRepoContract;
  paymentRepo: PaymentRepoContract;
  auditRepo: AuditLogRepoContract;
  waiverRepo: WaiverRepoContract;
  editorRepo: EditorRepoContract;
  couponRepo: CouponRepoContract;
  payerRepo: PayerRepoContract;
};

const defaultOptions: WorkOptions = {
  transactionType: TransactionType.ReadCommitted,
};

export class KnexUnitOfWork implements UnitOfWork<KnexRepos> {
  private transaction: Knex.Transaction | null = null;
  private options: WorkOptions | null = null;
  private repos: KnexRepos | null = null;

  constructor(private readonly knex: Knex, private readonly loggerBuilder: LoggerBuilderContract) {}

  async start(options: WorkOptions = defaultOptions): Promise<void> {
    this.options = options;

    this.transaction = await this.knex.transaction(null, {
      isolationLevel: options.transactionType,
    });

    this.repos = createRepos(this.transaction, this.loggerBuilder);
  }

  async work(workFunction: WorkFunction<KnexRepos>): Promise<void> {
    if (!this.options || !this.repos || !this.transaction) {
      throw new VError('The start method must be called before work is started');
    }

    const doWork = async () => {
      try {
        await workFunction(this.repos);

        this.transaction.commit();
      } catch (err) {
        this.transaction.rollback();
        throw err;
      }
    };

    try {
      await retryWork(doWork);
    } catch (err) {
      throw new VError('Work failed', err);
    }
  }
}

function createRepos(trx: Knex.Transaction, loggerBuilder: LoggerBuilderContract): KnexRepos {
  const invoiceItemsRepo = new KnexInvoiceItemRepo(trx, loggerBuilder.getLogger(KnexInvoiceItemRepo.name));
  const articleRepo = new KnexArticleRepo(trx, loggerBuilder.getLogger(KnexArticleRepo.name));

  const pausedReminderRepo = new KnexPausedReminderRepo(trx, loggerBuilder.getLogger(KnexPausedReminderRepo.name));
  const paymentMethodRepo = new KnexPaymentMethodRepo(trx, loggerBuilder.getLogger(KnexPaymentMethodRepo.name));
  const erpReferenceRepo = new KnexErpReferenceRepo(trx, loggerBuilder.getLogger(KnexErpReferenceRepo.name));
  const invoiceRepo = new KnexInvoiceRepo(trx, loggerBuilder.getLogger(KnexInvoiceRepo.name), articleRepo);
  const transactionRepo = new KnexTransactionRepo(trx, loggerBuilder.getLogger(KnexTransactionRepo.name));
  const publisherRepo = new KnexPublisherRepo(trx, loggerBuilder.getLogger(KnexPublisherRepo.name));
  const addressRepo = new KnexAddressRepo(trx, loggerBuilder.getLogger(KnexAddressRepo.name));
  const auditRepo = new KnexAuditLogRepo(trx, loggerBuilder.getLogger(KnexAuditLogRepo.name));
  const catalogRepo = new KnexCatalogRepo(trx, loggerBuilder.getLogger(KnexCatalogRepo.name));
  const paymentRepo = new KnexPaymentRepo(trx, loggerBuilder.getLogger(KnexPaymentRepo.name));
  const couponRepo = new KnexCouponRepo(trx, loggerBuilder.getLogger(KnexCouponRepo.name));
  const editorRepo = new KnexEditorRepo(trx, loggerBuilder.getLogger(KnexEditorRepo.name));
  const waiverRepo = new KnexWaiverRepo(trx, loggerBuilder.getLogger(KnexWaiverRepo.name));
  const payerRepo = new KnexPayerRepo(trx, loggerBuilder.getLogger(KnexPayerRepo.name));
  const exchangeRateRepo = new KnexExchangeRepo(trx);

  const creditNoteRepo = new KnexCreditNoteRepo(
    trx,
    invoiceItemsRepo,
    articleRepo,
    loggerBuilder.getLogger(KnexCreditNoteRepo.name)
  );
  const sentNotificationsRepo = new KnexSentNotificationsRepo(
    trx,
    loggerBuilder.getLogger(KnexSentNotificationsRepo.name)
  );

  return {
    sentNotificationsRepo,
    pausedReminderRepo,
    paymentMethodRepo,
    erpReferenceRepo,
    exchangeRateRepo,
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
    auditRepo,
    payerRepo,
  };
}
