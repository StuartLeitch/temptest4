import {BaseMockRepo} from '../../../../core/tests/mocks/BaseMockRepo';

import {TransactionRepoContract} from '../transactionRepo';
import {Transaction} from '../../domain/Transaction';
import {TransactionId} from '../../domain/TransactionId';

export class MockTransactionRepo extends BaseMockRepo<Transaction>
  implements TransactionRepoContract {
  constructor() {
    super();
  }

  public async delete(transaction: Transaction): Promise<boolean> {
    return true;
  }

  public async update(transaction: Transaction): Promise<Transaction> {
    const alreadyExists = await this.exists(transaction);

    if (alreadyExists) {
      this._items.map(t => {
        if (this.compareMockItems(t, transaction)) {
          return transaction;
        } else {
          return t;
        }
      });
    }

    return transaction;
  }

  public async getTransactionByManuscriptId(
    manuscriptId: string
  ): Promise<Transaction> {
    const matches = this._items.filter(
      t => t.manuscriptId.id.toString() === manuscriptId
    );

    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getTransactionById(
    transactionId: TransactionId
  ): Promise<Transaction> {
    const matches = this._items.filter(t =>
      t.transactionId.equals(transactionId)
    );
    if (matches.length !== 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  public async getTransactionCollection(
    params?: string[]
  ): Promise<Transaction[]> {
    return this._items;
  }

  public async exists(transaction: Transaction): Promise<boolean> {
    const found = this._items.filter(i =>
      this.compareMockItems(i, transaction)
    );
    return found.length !== 0;
  }

  public async save(transaction: Transaction): Promise<Transaction> {
    const alreadyExists = await this.exists(transaction);

    if (alreadyExists) {
      this._items.map(i => {
        if (this.compareMockItems(i, transaction)) {
          return transaction;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(transaction);
    }

    return transaction;
  }

  public compareMockItems(a: Transaction, b: Transaction): boolean {
    return a.id.equals(b.id);
  }
}
