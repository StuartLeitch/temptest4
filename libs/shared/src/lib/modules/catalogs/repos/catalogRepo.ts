import {Repo} from '../../../infrastructure/Repo';
import {CatalogItem} from '../domain/CatalogItem';
// import {CatalogId} from '../../domain/CatalogId';

export interface CatalogRepoContract extends Repo<CatalogItem> {
  getCatalogItemByType(type: string): Promise<CatalogItem>;
  // getTransactionById(transactionId: TransactionId): Promise<Transaction>;
  // getTransactionByArticleId(articleId: string): Promise<Transaction>;
  getCatalogCollection(): Promise<CatalogItem[]>;
  // delete(transaction: Transaction): Promise<unknown>;
  // update(transaction: Transaction): Promise<Transaction>;
}
