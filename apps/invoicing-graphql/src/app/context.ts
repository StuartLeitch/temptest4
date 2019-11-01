import {KnexInvoiceRepo} from '../../../../libs/shared/src/lib/modules/invoices/repos/implementations/knexInvoiceRepo'
import {KnexTransactionRepo} from '../../../../libs/shared/src/lib/modules/transactions/repos/implementations/knexTransactionRepo'

export interface ReposContext {
  invoice: KnexInvoiceRepo;
  transaction: KnexTransactionRepo;
}

export interface Context {
  repos: ReposContext;
}

export type ContextCreator = (params: any) => Context;

export function makeContext(db): ContextCreator {
  return () => ({
    repos: {
      invoice: new KnexInvoiceRepo(db),
      transaction: new KnexTransactionRepo(db)
    }
  });
}
