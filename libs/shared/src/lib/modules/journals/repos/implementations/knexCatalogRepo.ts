import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';

import { JournalId } from './../../domain/JournalId';
import { CatalogRepoContract } from './../catalogRepo';
import { CatalogMap } from './../../mappers/CatalogMap';
import { CatalogItem } from './../../domain/CatalogItem';
import { RepoError } from '../../../../infrastructure/RepoError';

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
      const c = await this.getCatalogItemById(catalogItem.id);
      return !!c;
    } catch (error) {
      // ! do nothing yet
    }

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

    return await db(TABLES.CATALOG).where({ type }).first();
  }

  async getCatalogItemByJournalId(journalId: JournalId): Promise<CatalogItem> {
    const { db } = this;

    const journal = await db(TABLES.CATALOG)
      .where({ journalId: journalId.id.toString() })
      .first();

    if (!journal) {
      throw RepoError.createEntityNotFoundError(
        'catalogItem',
        journalId.id.toString()
      );
    }

    return CatalogMap.toDomain(journal);
  }

  async updateCatalogItem(catalogItem: CatalogItem): Promise<CatalogItem> {
    const { db, logger } = this;

    const updatedSQL = db(TABLES.CATALOG)
      .where({ id: catalogItem.id.toString() })
      .update(CatalogMap.toPersistence(catalogItem));

    logger.debug('updateCatalogItem', {
      sql: updatedSQL.toString(),
    });

    const updated = await updatedSQL;
    if (!updated) {
      throw RepoError.createEntityNotFoundError(
        'invoice',
        catalogItem.id.toString()
      );
    }

    return catalogItem;
  }
}
