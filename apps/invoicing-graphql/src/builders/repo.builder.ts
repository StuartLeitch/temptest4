/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import Knex from 'knex';

import {
  KnexSentNotificationsRepo,
  KnexPausedReminderRepo,
  KnexPaymentMethodRepo,
  KnexInvoiceItemRepo,
  KnexTransactionRepo,
  KnexPublisherRepo,
  KnexAddressRepo,
  KnexArticleRepo,
  KnexCatalogRepo,
  KnexInvoiceRepo,
  KnexPaymentRepo,
  KnexCouponRepo,
  KnexEditorRepo,
  KnexWaiverRepo,
  KnexPayerRepo,
  KnexErpReferenceRepo,
  KnexAuditLogRepo,
  KnexCreditNoteRepo,
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
}

export function buildRepos(db: Knex, loggerBuilder: LoggerBuilder): Repos {
  const articleRepo = new KnexArticleRepo(db, loggerBuilder.getLogger());
  const invoiceItemRepo = new KnexInvoiceItemRepo(
    db,
    loggerBuilder.getLogger()
  );

  return {
    address: new KnexAddressRepo(db, loggerBuilder.getLogger()),
    catalog: new KnexCatalogRepo(db, loggerBuilder.getLogger()),
    invoice: new KnexInvoiceRepo(
      db,
      loggerBuilder.getLogger(),
      null,
      articleRepo,
      invoiceItemRepo
    ),
    invoiceItem: invoiceItemRepo,
    transaction: new KnexTransactionRepo(db, loggerBuilder.getLogger()),
    payer: new KnexPayerRepo(db, loggerBuilder.getLogger()),
    payment: new KnexPaymentRepo(db, loggerBuilder.getLogger()),
    paymentMethod: new KnexPaymentMethodRepo(db, loggerBuilder.getLogger()),
    waiver: new KnexWaiverRepo(db, loggerBuilder.getLogger()),
    manuscript: articleRepo,
    creditNote: new KnexCreditNoteRepo(
      db,
      invoiceItemRepo,
      articleRepo,
      loggerBuilder.getLogger()
    ),
    editor: new KnexEditorRepo(db, loggerBuilder.getLogger()),
    coupon: new KnexCouponRepo(db, loggerBuilder.getLogger()),
    publisher: new KnexPublisherRepo(db, loggerBuilder.getLogger()),
    sentNotifications: new KnexSentNotificationsRepo(
      db,
      loggerBuilder.getLogger()
    ),
    pausedReminder: new KnexPausedReminderRepo(db, loggerBuilder.getLogger()),
    erpReference: new KnexErpReferenceRepo(db, loggerBuilder.getLogger()),
    audit: new KnexAuditLogRepo(db, loggerBuilder.getLogger()),
  };
}
