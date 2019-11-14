import {Knex, TABLES} from '@hindawi/shared';
import {Transaction} from '../../domain/Transaction';
import {TransactionId} from '../../domain/TransactionId';
import {TransactionMap} from '../../mappers/TransactionMap';
import {InvoiceId} from './../../../invoices/domain/InvoiceId';

import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';
import {RepoError} from '../../../../infrastructure/RepoError';
import {TransactionRepoContract} from '../transactionRepo';

export class KnexTransactionRepo extends AbstractBaseDBRepo<Knex, Transaction>
  implements TransactionRepoContract {
  async getTransactionById(transactionId: TransactionId): Promise<Transaction> {
    const {db} = this;

    const transactionRow = await db(TABLES.TRANSACTIONS)
      .select()
      .where('id', transactionId.id.toString())
      .first();

    return transactionRow ? TransactionMap.toDomain(transactionRow) : null;
  }

  async getTransactionByInvoiceId(invoiceId: InvoiceId): Promise<Transaction> {
    const {db} = this;

    const transactionRow = await db(TABLES.TRANSACTIONS)
      .select()
      .where('invoice_id', invoiceId.id.toString())
      .first();

    return transactionRow ? TransactionMap.toDomain(transactionRow) : null;
  }

  async getTransactionCollection(): Promise<Transaction[]> {
    const {db} = this;

    const transactionsRows = await db(TABLES.TRANSACTIONS);

    return transactionsRows.reduce((aggregator: any[], t) => {
      aggregator.push(TransactionMap.toDomain(t));
      return aggregator;
    }, []);
  }

  async delete(transaction: Transaction): Promise<unknown> {
    const {db} = this;

    const deletedRows = await db(TABLES.TRANSACTIONS)
      .where('id', transaction.id.toString())
      .update({...TransactionMap.toPersistence(transaction), deleted: 1});

    return deletedRows
      ? deletedRows
      : Promise.reject(
          RepoError.createEntityNotFoundError(
            'transaction',
            transaction.id.toString()
          )
        );
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const {db} = this;

    const updated = await db(TABLES.TRANSACTIONS)
      .where({id: transaction.id.toString()})
      .update(TransactionMap.toPersistence(transaction));

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'transaction',
        transaction.id.toString()
      );
    }

    return transaction;
  }

  async exists(transaction: Transaction): Promise<boolean> {
    const result = await this.getTransactionById(transaction.transactionId);

    return !!result;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const {db} = this;

    const data = TransactionMap.toPersistence(transaction);

    await db(TABLES.TRANSACTIONS).insert(data);

    return this.getTransactionById(transaction.transactionId);
  }
}
