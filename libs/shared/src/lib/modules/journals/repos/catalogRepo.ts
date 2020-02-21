import { Repo } from '../../../infrastructure/Repo';
import { CatalogItem } from '../domain/CatalogItem';
import { JournalId } from '../domain/JournalId';
import { UniqueEntityID } from '@hindawi/shared';

export interface CatalogRepoContract extends Repo<CatalogItem> {
  getCatalogItemByJournalId(journalId: JournalId): Promise<CatalogItem>;
  getCatalogItemByType(type: string): Promise<CatalogItem>;
  getCatalogItemById(catalogId: UniqueEntityID): Promise<CatalogItem>;
  // getTransactionById(transactionId: TransactionId): Promise<Transaction>;
  // getTransactionByArticleId(articleId: string): Promise<Transaction>;
  getCatalogCollection(): Promise<CatalogItem[]>;
  // delete(transaction: Transaction): Promise<unknown>;
  // update(transaction: Transaction): Promise<Transaction>;
  updateCatalogItem(catalogItem: CatalogItem): Promise<CatalogItem>;
}
