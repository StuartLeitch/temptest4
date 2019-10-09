import {BaseJsonRepo} from '../../../../infrastructure/BaseJsonRepo';
import {TransactionRepoContract} from '../transactionRepo';
import {Transaction} from '../../domain/Transaction';
import {TransactionId} from '../../domain/TransactionId';
import {TransactionMap} from '../../mappers/TransactionMap';

export class TransactionJsonRepo extends BaseJsonRepo<Transaction>
  implements TransactionRepoContract {
  private db;

  constructor(db: any) {
    super();
    this.db = db;
  }

  public async getTransactionByArticleId(
    articleId: string
  ): Promise<Transaction> {
    const rawTransaction = await this.db
      .get('transactions')
      .find({articleId})
      .value();

    return rawTransaction ? TransactionMap.toDomain(rawTransaction) : null;
  }

  public async getTransactionById(
    transactionId: TransactionId
  ): Promise<Transaction> {
    console.info(transactionId);
    const rawTransaction = this.db
      .get('transactions')
      .find({id: transactionId})
      .value();

    return rawTransaction ? TransactionMap.toDomain(rawTransaction) : null;
  }

  public async getTransactionCollection(
    articleId: string
  ): Promise<Transaction[]> {
    return this._items.filter(i => i.articleId.id.toString() === articleId);
  }

  public async exists(transaction: Transaction): Promise<boolean> {
    const found = this._items.filter(i =>
      this.compareJsonItems(i, transaction)
    );
    return found.length !== 0;
  }

  public async save(transaction: Transaction): Promise<Transaction> {
    const rawTransaction = TransactionMap.toPersistence(transaction);

    this.db
      .get('transactions')
      .push(rawTransaction)
      .write();

    return transaction;
  }

  public compareJsonItems(a: Transaction, b: Transaction): boolean {
    return a.id.equals(b.id);
  }
}
