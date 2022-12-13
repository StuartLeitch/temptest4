import Knex from 'knex';

import {
  KnexSentNotificationsRepo,
  KnexPausedReminderRepo,
  KnexPaymentMethodRepo,
  KnexErpReferenceRepo,
  KnexInvoiceItemRepo,
  KnexTransactionRepo,
  KnexCreditNoteRepo,
  KnexPublisherRepo,
  KnexAuditLogRepo,
  KnexExchangeRepo,
  KnexAddressRepo,
  KnexArticleRepo,
  KnexCatalogRepo,
  KnexInvoiceRepo,
  KnexPaymentRepo,
  KnexCouponRepo,
  KnexEditorRepo,
  KnexWaiverRepo,
  KnexPayerRepo,
  LoggerBuilder,
} from '@hindawi/shared';

export interface Repos {
  address: KnexAddressRepo;
  catalog: KnexCatalogRepo;
  invoice: KnexInvoiceRepo;
  invoiceItem: KnexInvoiceItemRepo;
  transaction: KnexTransactionRepo;
  payer: KnexPayerRepo;
  payment: KnexPaymentRepo;
  paymentMethod: KnexPaymentMethodRepo;
  waiver: KnexWaiverRepo;
  manuscript: KnexArticleRepo;
  creditNote: KnexCreditNoteRepo;
  editor: KnexEditorRepo;
  coupon: KnexCouponRepo;
  publisher: KnexPublisherRepo;
  sentNotifications: KnexSentNotificationsRepo;
  pausedReminder: KnexPausedReminderRepo;
  erpReference: KnexErpReferenceRepo;
  audit: KnexAuditLogRepo;
  exchangeRate: KnexExchangeRepo;
}

export function buildRepos(db: Knex, loggerBuilder: LoggerBuilder): Repos {
  const articleRepo = new KnexArticleRepo(db, loggerBuilder.getLogger(KnexArticleRepo.name));
  const invoiceItemRepo = new KnexInvoiceItemRepo(db, loggerBuilder.getLogger(KnexInvoiceItemRepo.name));

  return {
    address: new KnexAddressRepo(db, loggerBuilder.getLogger(KnexAddressRepo.name)),
    catalog: new KnexCatalogRepo(db, loggerBuilder.getLogger(KnexCatalogRepo.name)),
    invoice: new KnexInvoiceRepo(
      db,

      loggerBuilder.getLogger(KnexInvoiceRepo.name),
      articleRepo
    ),

    invoiceItem: invoiceItemRepo,
    transaction: new KnexTransactionRepo(db, loggerBuilder.getLogger(KnexTransactionRepo.name)),
    payer: new KnexPayerRepo(db, loggerBuilder.getLogger(KnexPayerRepo.name)),
    payment: new KnexPaymentRepo(db, loggerBuilder.getLogger(KnexPaymentRepo.name)),
    paymentMethod: new KnexPaymentMethodRepo(db, loggerBuilder.getLogger(KnexPaymentMethodRepo.name)),
    waiver: new KnexWaiverRepo(db, loggerBuilder.getLogger(KnexWaiverRepo.name)),
    manuscript: articleRepo,
    creditNote: new KnexCreditNoteRepo(
      db,
      invoiceItemRepo,
      articleRepo,
      loggerBuilder.getLogger(KnexCreditNoteRepo.name)
    ),
    editor: new KnexEditorRepo(db, loggerBuilder.getLogger(KnexEditorRepo.name)),
    coupon: new KnexCouponRepo(db, loggerBuilder.getLogger(KnexCouponRepo.name)),
    publisher: new KnexPublisherRepo(db, loggerBuilder.getLogger(KnexPublisherRepo.name)),
    sentNotifications: new KnexSentNotificationsRepo(db, loggerBuilder.getLogger(KnexSentNotificationsRepo.name)),
    pausedReminder: new KnexPausedReminderRepo(db, loggerBuilder.getLogger(KnexPausedReminderRepo.name)),
    erpReference: new KnexErpReferenceRepo(db, loggerBuilder.getLogger(KnexErpReferenceRepo.name)),
    audit: new KnexAuditLogRepo(db, loggerBuilder.getLogger(KnexAuditLogRepo.name)),
    exchangeRate: new KnexExchangeRepo(db),
  };
}
