import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { CatalogItem } from './../../domain/CatalogItem';
import { CatalogMap } from './../../mappers/CatalogMap';
import { JournalId } from './../../domain/JournalId';

import { CatalogRepoContract } from './../catalogRepo';

export class KnexCatalogRepo
  extends AbstractBaseDBRepo<Knex, CatalogItem>
  implements CatalogRepoContract {
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

  async getCatalogCollection(): Promise<
    Either<GuardFailure | RepoError, CatalogItem[]>
  > {
    const { db } = this;

    const catalogsRows: Array<any> = await db(TABLES.CATALOG);

    return flatten(catalogsRows.map(CatalogMap.toDomain));
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
}
