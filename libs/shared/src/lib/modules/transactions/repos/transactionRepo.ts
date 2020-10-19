import { Repo } from '../../../infrastructure/Repo';
import { Transaction } from '../domain/Transaction';
import { TransactionId } from '../domain/TransactionId';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

export interface TransactionRepoContract extends Repo<Transaction> {
  getTransactionById(transactionId: TransactionId): Promise<Transaction>;
  getTransactionByInvoiceId(invoiceId: InvoiceId): Promise<Transaction>;
  getTransactionCollection(): Promise<Transaction[]>;
  delete(transaction: Transaction): Promise<unknown>;
  restore(transaction: Transaction): Promise<unknown>;
  update(transaction: Transaction): Promise<Transaction>;
}
