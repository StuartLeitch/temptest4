import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { Invoices } from '../../../invoices/domain/Invoices';
import { TransactionId } from '../../domain/TransactionId';
import { Invoice } from '../../../invoices/domain/Invoice';
import { Transaction } from '../../domain/Transaction';

import { TransactionRepoContract } from '../transactionRepo';

export class MockTransactionRepo
  extends BaseMockRepo<Transaction>
  implements TransactionRepoContract {
  deletedItems: Transaction[] = [];

  constructor() {
    super();
  }

  public async delete(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, void>> {
    this.deletedItems.push(transaction);
    return right(null);
  }

  public async restore(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const index = this.deletedItems.findIndex((item) =>
      item.id.equals(transaction.id)
    );
    if (index >= 0) {
      this.deletedItems.splice(index, 1);
    }

    return right(null);
  }

  public async update(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const maybeAlreadyExists = await this.exists(transaction);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items = this._items.map((t) => {
        if (this.compareMockItems(t, transaction)) {
          return transaction;
        } else {
          return t;
        }
      });
    }

    return right(transaction);
  }

  public async getTransactionById(
    transactionId: TransactionId
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const matches = this._items.filter((t) =>
      t.transactionId.equals(transactionId)
    );

    if (matches.length !== 0) {
      return right(matches[0]);
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction',
          transactionId.toString()
        )
      );
    }
  }

  public async getTransactionByInvoiceId(
    invoiceId: InvoiceId
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const match = this._items.find((t) =>
      t.invoices.getItems().some((i) => i.invoiceId.equals(invoiceId))
    );

    if (match) {
      return right(match);
    } else {
      return left(
        RepoError.createEntityNotFoundError(
          'transaction for invoice',
          invoiceId.toString()
        )
      );
    }
  }

  public async getTransactionCollection(
    params?: string[]
  ): Promise<Either<GuardFailure | RepoError, Transaction[]>> {
    return right(this._items);
  }

  public async exists(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, transaction)
    );
    return right(found.length !== 0);
  }

  public async save(
    transaction: Transaction
  ): Promise<Either<GuardFailure | RepoError, Transaction>> {
    const maybeAlreadyExists = await this.exists(transaction);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, transaction)) {
          return transaction;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(transaction);
    }

    return right(transaction);
  }

  public compareMockItems(a: Transaction, b: Transaction): boolean {
    return a.id.equals(b.id);
  }
}
