import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Repo } from '../../../infrastructure/Repo';
import { CatalogItem } from '../domain/CatalogItem';
import { JournalId } from '../domain/JournalId';

export interface CatalogRepoContract extends Repo<CatalogItem> {
  getCatalogItemByJournalId(journalId: JournalId): Promise<CatalogItem>;
  getCatalogItemByType(type: string): Promise<CatalogItem>;
  getCatalogItemById(catalogId: UniqueEntityID): Promise<CatalogItem>;
  getCatalogCollection(): Promise<CatalogItem[]>;
  updateCatalogItem(catalogItem: CatalogItem): Promise<CatalogItem>;
}
