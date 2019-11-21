import Knex from 'knex';
import {
  KnexPaymentMethodRepo,
  KnexAddressRepo,
  KnexArticleRepo,
  KnexInvoiceItemRepo,
  KnexInvoiceRepo,
  KnexTransactionRepo,
  KnexPaymentRepo,
  KnexPayerRepo,
  KnexWaiverRepo,
  KnexCatalogRepo,
  VATService,
  WaiverService,
  EmailService
} from '@hindawi/shared';
import { Config } from './config';
import { CheckoutService } from './services/checkout';
import { AuthService } from './services/auth';

export interface ReposContext {
  address: KnexAddressRepo;
  invoice: KnexInvoiceRepo;
  catalog: KnexCatalogRepo;
  invoiceItem: KnexInvoiceItemRepo;
  transaction: KnexTransactionRepo;
  payer: KnexPayerRepo;
  payment: KnexPaymentRepo;
  paymentMethods: KnexPaymentMethodRepo;
  waiver: KnexWaiverRepo;
  manuscript: KnexArticleRepo;
}

export interface Context {
  repos: ReposContext;
  checkoutService: CheckoutService;
  authService: AuthService;
  vatService: VATService;
  waiverService: WaiverService;
  emailService: EmailService;
}

export function makeContext(config: Config, db: Knex): Context {
  return {
    repos: {
      address: new KnexAddressRepo(db),
      catalog: new KnexCatalogRepo(db),
      invoice: new KnexInvoiceRepo(db),
      invoiceItem: new KnexInvoiceItemRepo(db),
      transaction: new KnexTransactionRepo(db),
      payer: new KnexPayerRepo(db),
      payment: new KnexPaymentRepo(db),
      paymentMethods: new KnexPaymentMethodRepo(db),
      waiver: new KnexWaiverRepo(db),
      manuscript: new KnexArticleRepo(db)
    },
    checkoutService: new CheckoutService(),
    authService: new AuthService(config),
    vatService: new VATService(),
    waiverService: new WaiverService(),
    emailService: new EmailService()
  };
}
