import { UniqueEntityID } from './../../../../core/domain/UniqueEntityID';
// import {shallowEqual} from 'shallow-equal-object';
import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { CatalogRepoContract } from '../catalogRepo';
import { CatalogItem } from '../../domain/CatalogItem';
import { JournalId } from '../../domain/JournalId';

export class MockCatalogRepo extends BaseMockRepo<CatalogItem>
  implements CatalogRepoContract {
  constructor() {
    super();
  }

  public async getCatalogItemByType(type: string): Promise<CatalogItem> {
    const match = this._items.find((i) => i.type === type);
    return match ? match : null;
  }

  public async getCatalogItemByJournalId(
    journalId: JournalId
  ): Promise<CatalogItem> {
    const match = this._items.find((i) => i.journalId.equals(journalId));
    return match ? match : null;
  }

  public async getCatalogItemById(
    catalogId: UniqueEntityID
  ): Promise<CatalogItem> {
    const match = this._items.find((i) => i.id.equals(catalogId));
    return match ? match : null;
  }

  public async getCatalogCollection(): Promise<CatalogItem[]> {
    return this._items;
  }

  public async updateCatalogItem(
    catalogItem: CatalogItem
  ): Promise<CatalogItem> {
    if (await this.exists(catalogItem)) {
      await this.save(catalogItem);
      return catalogItem;
    }
    return null;
  }

  public async exists(catalogItem: CatalogItem): Promise<boolean> {
    const found = this._items.filter((i) =>
      this.compareMockItems(i, catalogItem)
    );
    return found.length !== 0;
  }

  public async save(catalogItem: CatalogItem): Promise<CatalogItem> {
    const alreadyExists = await this.exists(catalogItem);

    if (alreadyExists) {
      this._items.map((i) => {
        if (this.compareMockItems(i, catalogItem)) {
          return catalogItem;
        } else {
          return i;
        }
      });
    } else {
      this._items.push(catalogItem);
    }

    return catalogItem;
  }

  public compareMockItems(a: CatalogItem, b: CatalogItem): boolean {
    return a.id.equals(b.id);
  }
}
