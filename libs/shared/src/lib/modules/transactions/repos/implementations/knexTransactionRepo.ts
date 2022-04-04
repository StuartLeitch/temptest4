import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { TABLES } from './../../../../infrastructure/database/knex/index';
import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceId } from './../../../invoices/domain/InvoiceId';
import { TransactionId } from '../../domain/TransactionId';
import { Transaction } from '../../domain/Transaction';

import { TransactionMap } from '../../mappers/TransactionMap';

import { TransactionRepoContract } from '../transactionRepo';
import Knex from "knex";

export class KnexTransactionRepo
  extends AbstractBaseDBRepo<Knex, Transaction>
  implements TransactionRepoContract {
  async getTransactionById(
    transactionId: TransactionId
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const { db } = this;

    const transactionRow = await db(TABLES.TRANSACTIONS)
      .select()
      .where('id', transactionId.id.toString())
      .first();

    if (!transactionRow) {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction',
          transactionId.toString()
        )
      );
    }

    return TransactionMap.toDomain(transactionRow);
  }

  async getTransactionByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const { db, logger } = this;
    const correlationId =
      'correlationId' in this ? (this as any).correlationId : null;

    const transactionRow = await db(TABLES.INVOICES)
      .select(
        'transactions.id as id',
        'transactions.status as status',
        'transactions.deleted as deleted',
        'transactions.dateCreated as dateCreated',
        'transactions.dateUpdated as dateUpdated'
      )
      .leftJoin(
        'transactions',
        'transactions.id',
        '=',
        'invoices.transactionId'
      )
      .where('invoices.id', invoiceId.id.toString())
      .first();

    logger.debug('select', {
      correlationId,
      sql: transactionRow.toString(),
    });

    if (!transactionRow) {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction for invoice',
          invoiceId.toString()
        )
      );
    }

    return TransactionMap.toDomain(transactionRow);
  }

  async getTransactionCollection(): Promise<
    Either<GuardFailure | RepoError, Transaction[]>
  > {
    const { db } = this;

    const transactionsRows = await db(TABLES.TRANSACTIONS);

    return flatten(transactionsRows.map(TransactionMap.toDomain));
  }

  async delete(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const deletedRows = await db(TABLES.TRANSACTIONS)
      .where('id', transaction.id.toString())
      .update({ ...TransactionMap.toPersistence(transaction), deleted: 1 });

    if (!deletedRows) {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction',
          transaction.id.toString()
        )
      );
    }

    return right(null);
  }

  async restore(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const restoredRows = await db(TABLES.TRANSACTIONS)
      .where('id', transaction.id.toString())
      .update({ ...TransactionMap.toPersistence(transaction), deleted: 0 });

    if (!restoredRows) {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction',
          transaction.id.toString()
        )
      );
    }

    return right(null);
  }

  async update(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const { db } = this;

    const updated = await db(TABLES.TRANSACTIONS)
      .where({ id: transaction.id.toString() })
      .update(TransactionMap.toPersistence(transaction));

    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction',
          transaction.id.toString()
        )
      );
    }

    return this.getTransactionById(transaction.transactionId);
  }

  async exists(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const result = await this.getTransactionById(transaction.transactionId);

    return right(!!result);
  }

  async save(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const { db } = this;

    const data = TransactionMap.toPersistence(transaction);

    await db(TABLES.TRANSACTIONS).insert(data);

    return this.getTransactionById(transaction.transactionId);
  }
}
