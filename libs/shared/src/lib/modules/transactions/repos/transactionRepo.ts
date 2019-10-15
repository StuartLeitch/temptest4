import {Repo} from '../../../infrastructure/Repo';
import {Transaction} from '../domain/Transaction';
import {TransactionId} from '../domain/TransactionId';

export interface TransactionRepoContract extends Repo<Transaction> {
  getTransactionById(transactionId: TransactionId): Promise<Transaction>;
  getTransactionCollection(): Promise<Transaction[]>;
  delete(transaction: Transaction): Promise<unknown>;
  update(transaction: Transaction): Promise<Transaction>;
}
