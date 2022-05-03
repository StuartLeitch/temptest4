import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { CatalogItem } from './../../domain/CatalogItem';
import { CatalogMap } from './../../mappers/CatalogMap';
import { JournalId } from './../../domain/JournalId';

import { CatalogRepoContract, JournalPriceUpdate } from './../catalogRepo';
import { CatalogPaginated } from '../../domain/CatalogPaginated';
import { applyFilters } from '../../../invoices/repos/implementations/utils';

export class KnexCatalogRepo
  extends AbstractBaseDBRepo<Knex, CatalogItem>
  implements CatalogRepoContract
{
  async getCatalogItemById(
    catalogId: UniqueEntityID
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const { db } = this;

    const catalogItem = await db(TABLES.CATALOG)
      .where({ id: catalogId.toString() })
      .first();

    if (!catalogItem) {
      return left(
        RepoError.createEntityNotFoundError('catalogItem', catalogId.toString())
      );
    }

    return CatalogMap.toDomain(catalogItem);
  }

  async exists(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      const result = await this.getCatalogItemById(catalogItem.id);

      if (result.isRight()) {
        return right(true);
      } else {
        if (
          result.value instanceof RepoError &&
          result.value.code === RepoErrorCode.ENTITY_NOT_FOUND
        ) {
          return right(false);
        } else {
          return left(result.value);
        }
      }
    } catch (error) {
      return left(RepoError.fromDBError(error));
    }
  }

  async save(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const { db } = this;

    try {
      await db(TABLES.CATALOG).insert(CatalogMap.toPersistence(catalogItem));
      return right(catalogItem);
    } catch (err) {
      return left(RepoError.fromDBError(err));
    }
  }

  async getCatalogCollection(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, CatalogPaginated>> {
    const { pagination, filters } = args;
    const { db } = this;

    const getModel = () => db(TABLES.CATALOG);

    const totalCount = await applyFilters(getModel(), filters).count(
      `${TABLES.CATALOG}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const sql = applyFilters(getModel(), filters)
      .orderBy(`${TABLES.CATALOG}.journalTitle`, 'asc')
      .offset(offset < totalCount[0].count ? offset : 0)
      .limit(pagination.limit)
      .select([`${TABLES.CATALOG}.*`]);
    console.info(sql.toString());

    const catalogsItems: Array<any> = await sql;

    const maybeCatalogItems = flatten(catalogsItems.map(CatalogMap.toDomain));

    if (maybeCatalogItems.isLeft()) {
      return left(maybeCatalogItems.value);
    }

    return right({
      catalogItems: maybeCatalogItems.value,
      totalCount: totalCount[0]['count'],
    });
  }

  async getCatalogItemByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const { db } = this;

    const journal = await db(TABLES.CATALOG)
      .where({ journalId: journalId.id.toString() })
      .first();

    if (!journal) {
      return left(
        RepoError.createEntityNotFoundError(
          'catalogItem',
          journalId.id.toString()
        )
      );
    }

    return CatalogMap.toDomain(journal);
  }

  async updateCatalogItem(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>> {
    const { db, logger } = this;

    const updatedSQL = db(TABLES.CATALOG)
      .where({ id: catalogItem.id.toString() })
      .update(CatalogMap.toPersistence(catalogItem));

    logger.debug('updateCatalogItem', {
      sql: updatedSQL.toString(),
    });

    const updated = await updatedSQL;
    if (!updated) {
      return left(
        RepoError.createEntityNotFoundError(
          'invoice',
          catalogItem.id.toString()
        )
      );
    }

    return this.getCatalogItemById(catalogItem.id);
  }

  async bulkUpdate(
    catalogItems: Array<JournalPriceUpdate>
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const trx = await db.transaction();

    try {
      const updates = catalogItems.map((catalogItem) =>
        trx(TABLES.CATALOG)
          .update({ amount: catalogItem.amount })
          .where({ journalId: catalogItem.journalId.id.toString() })
      );
      await Promise.all(updates);

      await trx.commit();

      return right(null);
    } catch (error) {
      await trx.rollback();
      return left(RepoError.fromDBError(error));
    }
  }
}
