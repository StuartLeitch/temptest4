import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';

import { JournalId } from './../../domain/JournalId';
import { CatalogRepoContract } from './../catalogRepo';
import { CatalogMap } from './../../mappers/CatalogMap';
import { CatalogItem } from './../../domain/CatalogItem';
import { RepoError } from 'libs/shared/src/lib/infrastructure/RepoError';
import { UniqueEntityID } from '@hindawi/shared';

export class KnexCatalogRepo extends AbstractBaseDBRepo<Knex, CatalogItem>
  implements CatalogRepoContract {
  async getCatalogItemById(catalogId: UniqueEntityID): Promise<CatalogItem> {
    const { db } = this;

    const catalogItem = await db(TABLES.CATALOG)
      .where({ id: catalogId.toString() })
      .first();

    if (!catalogItem) {
      throw RepoError.createEntityNotFoundError(
        'catalogItem',
        catalogItem.id.toString()
      );
    }

    return CatalogMap.toDomain(catalogItem);
  }

  async exists(catalogItem: CatalogItem): Promise<boolean> {
    try {
      let c = await this.getCatalogItemById(catalogItem.id);
      return !!c;
    } catch (error) {}
    return false;
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
      .where({ type })
      .first();
  }

  async getCatalogItemByJournalId(journalId: JournalId): Promise<CatalogItem> {
    const { db } = this;

    const journal = await db(TABLES.CATALOG)
      .where({ journalId: journalId.id.toString() })
      .first();

    if (!journal) {
      throw RepoError.createEntityNotFoundError(
        'catalogItem',
        journal.id.toString()
      );
    }

    return CatalogMap.toDomain(journal);
  }

  async updateCatalogItem(catalogItem: CatalogItem): Promise<CatalogItem> {
    const { db } = this;

    const updated = await db(TABLES.CATALOG)
      .where({ id: catalogItem.id.toString() })
      .update(CatalogMap.toPersistence(catalogItem));

    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        catalogItem.id.toString()
      );
    }

    return catalogItem;
  }
}
