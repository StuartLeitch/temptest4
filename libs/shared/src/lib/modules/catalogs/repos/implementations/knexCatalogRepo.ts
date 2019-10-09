import {
  CatalogItem,
  // CatalogId,
  CatalogRepoContract,
  CatalogMap
} from '@hindawi/shared';

import {Knex} from '../../../../../../apps/server/src/services/db';
import {AbstractBaseDBRepo} from '../../../../infrastructure/AbstractBaseDBRepo';

export class CatalogKnexRepo extends AbstractBaseDBRepo<Knex, CatalogItem>
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

  async getPriceByType(type = 'APC'): Promise<number> {
    const {db} = this;

    const catalogItem = await db('catalog')
      .where({type})
      .first();

    return catalogItem.price as number;
  }
}
