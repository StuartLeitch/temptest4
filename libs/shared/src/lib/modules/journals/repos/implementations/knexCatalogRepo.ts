import {Knex, TABLES} from '../../../../infrastructure/database/knex';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';

import {JournalId} from './../../domain/JournalId';
import {CatalogRepoContract} from './../catalogRepo';
import {CatalogMap} from './../../mappers/CatalogMap';
import {CatalogItem} from './../../domain/CatalogItem';

export class KnexCatalogRepo extends AbstractBaseDBRepo<Knex, CatalogItem>
  implements CatalogRepoContract {
  exists(catalogItem: CatalogItem): Promise<boolean> {
    return Promise.resolve(true);
  }

  async save(catalogItem: CatalogItem): Promise<CatalogItem> {
    const { db } = this;

    await db(TABLES.CATALOG).insert(CatalogMap.toPersistence(catalogItem));

    return catalogItem;
  }

  async getCatalogCollection(): Promise<CatalogItem[]> {
    const { db } = this;

    const catalogsRows = await db(TABLES.CATALOG);

    return catalogsRows.reduce((aggregator: any[], t) => {
      aggregator.push(CatalogMap.toDomain(t));
      return aggregator;
    }, []);
  }

  async getCatalogItemByType(type = 'APC'): Promise<CatalogItem> {
    const { db } = this;

    return await db(TABLES.CATALOG)
      .where({type})
      .first();
  }

  async getCatalogItemByJournalId(journalId: JournalId): Promise<CatalogItem> {
    const { db } = this;

    return await db(TABLES.CATALOG)
      .where({journal_id: journalId.id.toString()})
      .first();
  }
}
