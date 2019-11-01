import {
  CatalogItem,
  // CatalogId,
  CatalogRepoContract,
  CatalogMap,
  JournalId
} from '@hindawi/shared';

import {Knex} from '../../../../infrastructure/database/knex';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';

export class KnexCatalogRepo extends AbstractBaseDBRepo<Knex, CatalogItem>
  implements CatalogRepoContract {
  exists(catalogItem: CatalogItem): Promise<boolean> {
    return Promise.resolve(true);
  }

  async save(catalogItem: CatalogItem): Promise<CatalogItem> {
    const {db} = this;

    await db('catalog').insert(CatalogMap.toPersistence(catalogItem));

    return catalogItem;
  }

  async getCatalogCollection(): Promise<CatalogItem[]> {
    const {db} = this;

    const catalogsRows = await db('catalog');

    return catalogsRows.reduce((aggregator: any[], t) => {
      aggregator.push(CatalogMap.toDomain(t));
      return aggregator;
    }, []);
  }

  async getCatalogItemByType(type = 'APC'): Promise<CatalogItem> {
    const {db} = this;

    return await db('catalog')
      .where({type})
      .first();
  }

  async getCatalogItemByJournalId(journalId: JournalId): Promise<CatalogItem> {
    const {db} = this;

    return await db('catalog')
      .where({journal_id: journalId.id.toString()})
      .first();
  }
}
