import {Knex, KnexInvoiceRepo, KnexTransactionRepo} from '@hindawi/shared';

export interface ReposContext {
  invoice: KnexInvoiceRepo;
  transaction: KnexTransactionRepo;
}

export interface Context {
  repos: ReposContext;
}

export type ContextCreator = (params: any) => Context;

export function makeContext(db: Knex): ContextCreator {
  return () => ({
    repos: {
      invoice: new KnexInvoiceRepo(db),
      transaction: new KnexTransactionRepo(db)
    }
  });
}
