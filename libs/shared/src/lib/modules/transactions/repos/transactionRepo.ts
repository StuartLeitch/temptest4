import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { TransactionId } from '../domain/TransactionId';
import { Transaction } from '../domain/Transaction';

export interface TransactionRepoContract extends Repo<Transaction> {
  getTransactionById(transactionId: TransactionId): Promise<Either<GuardFailure | RepoError, Transaction>>;
  getTransactionByInvoiceId(invoiceId: InvoiceId): Promise<Either<GuardFailure | RepoError, Transaction>>;
  getTransactionCollection(): Promise<Either<GuardFailure | RepoError, Transaction[]>>;
  delete(transaction: Transaction): Promise<Either<GuardFailure | RepoError, void>>;
  restore(transaction: Transaction): Promise<Either<GuardFailure | RepoError, void>>;
  update(transaction: Transaction): Promise<Either<GuardFailure | RepoError, Transaction>>;
}
