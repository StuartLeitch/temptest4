import Knex from 'knex';
import {KnexInvoiceRepo, KnexTransactionRepo, KnexPaymentRepo} from '@hindawi/shared';
import { Config } from './config';
import { CheckoutService } from './services/checkout';
import { AuthService } from './services/auth';

export interface ReposContext {
  invoice: KnexInvoiceRepo;
  transaction: KnexTransactionRepo;
  payment: KnexPaymentRepo;
}

export interface Context {
  repos: ReposContext;
  checkoutService: CheckoutService;
  authService: AuthService;
}

export function makeContext(config: Config, db: Knex): Context{
  return {
    repos: {
      invoice: new KnexInvoiceRepo(db),
      transaction: new KnexTransactionRepo(db),
      payment: new KnexPaymentRepo(db),
    },
    checkoutService: new CheckoutService(),
    authService: new AuthService(config)
  };
}
