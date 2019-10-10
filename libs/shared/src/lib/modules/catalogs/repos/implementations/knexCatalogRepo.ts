import {
  CatalogItem,
  // CatalogId,
  CatalogRepoContract,
  CatalogMap,
  Knex
} from '@hindawi/shared';

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

  async getPriceByType(type = 'APC'): Promise<number> {
    const {db} = this;

    const catalogItem = await db('catalog')
      .where({type})
      .first();

    return catalogItem.price as number;
  }
}
