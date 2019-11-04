import Knex from 'knex';
import {KnexInvoiceRepo, KnexTransactionRepo, KnexPaymentRepo} from '@hindawi/shared';
import { CheckoutService } from './services/checkout';

export interface ReposContext {
  invoice: KnexInvoiceRepo;
  transaction: KnexTransactionRepo;
  payment: KnexPaymentRepo;
}

export interface Context {
  repos: ReposContext;
  checkoutService: CheckoutService;
}

export function makeContext(db: Knex): Context{
  return {
    repos: {
      invoice: new KnexInvoiceRepo(db),
      transaction: new KnexTransactionRepo(db),
      payment: new KnexPaymentRepo(db),
    },
    checkoutService: new CheckoutService(),
  };
}
