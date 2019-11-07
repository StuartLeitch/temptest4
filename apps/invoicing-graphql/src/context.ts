import Knex from 'knex';
import {
  KnexInvoiceRepo,
  KnexTransactionRepo,
  KnexPaymentRepo,
  KnexWaiverRepo,
  VATService,
  WaiverService
} from '@hindawi/shared';
import {Config} from './config';
import {CheckoutService} from './services/checkout';
import {AuthService} from './services/auth';

export interface ReposContext {
  invoice: KnexInvoiceRepo;
  transaction: KnexTransactionRepo;
  payment: KnexPaymentRepo;
  waiver: KnexWaiverRepo;
}

export interface Context {
  repos: ReposContext;
  checkoutService: CheckoutService;
  authService: AuthService;
  vatService: VATService;
  waiverService: WaiverService;
}

export function makeContext(config: Config, db: Knex): Context {
  return {
    repos: {
      invoice: new KnexInvoiceRepo(db),
      transaction: new KnexTransactionRepo(db),
      payment: new KnexPaymentRepo(db),
      waiver: new KnexWaiverRepo(db),
    },
    checkoutService: new CheckoutService(),
    authService: new AuthService(config),
    vatService: new VATService(),
    waiverService: new WaiverService(),
  };
}
