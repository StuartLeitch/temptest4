import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left, flatten } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';
import { PublisherId } from '../../domain/PublisherId';
import { Publisher } from '../../domain/Publisher';

import { PublisherMap } from '../../mappers/PublisherMap';

import { PublisherRepoContract } from '../publisherRepo';
import { PublisherPaginated } from '../../domain/PublisherPaginated';
import { applyFilters } from '../../../invoices/repos/implementations/utils';

export class KnexPublisherRepo
  extends AbstractBaseDBRepo<Knex, Publisher>
  implements PublisherRepoContract {
  async getCustomValuesByPublisherId(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, PublisherCustomValues>> {
    const emptyValues: PublisherCustomValues = {
      customSegmentId: '',
      creditAccountId: '',
      debitAccountId: '',
      itemId: '',
      creditAccountIdForCascaded: '',
    };
    const data = await this.db(TABLES.PUBLISHER_CUSTOM_VALUES)
      .select('name', 'value')
      .where('publisherId', id.id.toString());

    if (!data.length) {
      return left(
        RepoError.createEntityNotFoundError(
          'publisher custom values with publisher id',
          id.id.toString()
        )
      );
    }

    return right(
      data.reduce(
        (acc: PublisherCustomValues, val: { name: string; value: string }) => {
          acc[val.name] = val.value;
          return acc;
        },
        emptyValues
      )
    );
  }

  async getPublishers(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, PublisherPaginated>> {
    const { pagination, filters } = args;
    const { db } = this;

    const getModel = () => db(TABLES.PUBLISHERS);

    const totalCount = await applyFilters(getModel(), filters).count(
      `${TABLES.PUBLISHERS}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const sql = await db
      .select('*')
      .from('publishers')
      .orderBy(`${TABLES.PUBLISHERS}.name`, 'asc')
      .offset(offset < totalCount[0].count ? offset : 0)
      .limit(pagination.limit);

    const publishers: Array<any> = await sql;

    const maybePublishers = flatten(publishers.map(PublisherMap.toDomain));

    if (maybePublishers.isLeft()) {
      return left(maybePublishers.value);
    }

    return right({
      totalCount: totalCount[0]['count'],
      publishers: maybePublishers.value,
    });
  }

  async getPublishersByPublisherId(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, PublisherPaginated>> {
    const { pagination, filters } = args;
    const { db } = this;

    const getModel = () => db(TABLES.CATALOG);
    const totalCount = await applyFilters(getModel(), filters).count(
      `${TABLES.CATALOG}.id`
    );

    const offset = pagination.offset * pagination.limit;

    const sql = await db
      .select('publishers.name AS name')
      .from('publishers')
      .leftJoin('catalog', 'catalog.publisherId', '=', 'publishers.id')
      .orderBy(`${TABLES.CATALOG}.created`, 'desc')
      .offset(offset < totalCount[0].count ? offset : 0)
      .limit(pagination.limit);

    const publisherNames: Array<any> = await sql;

    const maybePublisherNames = flatten(
      publisherNames.map(PublisherMap.toDomain)
    );

    if (maybePublisherNames.isLeft()) {
      return left(maybePublisherNames.value);
    }

    return right({
      totalCount: totalCount[0]['count'],
      publishers: maybePublisherNames.value,
    });
  }

  async getPublisherById(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, Publisher>> {
    const publisher = await this.db(TABLES.PUBLISHERS)
      .select()
      .where('id', id.id.toString())
      .first();

    if (!publisher) {
      return left(
        RepoError.createEntityNotFoundError('publisher', id.id.toString())
      );
    }

    const maybeCustomValues = await this.getCustomValuesByPublisherId(id);

    if (maybeCustomValues.isLeft()) {
      return left(maybeCustomValues.value);
    }

    const props = {
      dateCreated: publisher.dateCreated,
      dateUpdated: publisher.dateUpdated,
      name: publisher.name,
      id: publisher.id,
      customValues: maybeCustomValues.value,
    };

    return PublisherMap.toDomain(props);
  }

  async getPublisherByName(
    name: string
  ): Promise<Either<GuardFailure | RepoError, Publisher>> {
    const publisher = await this.db(TABLES.PUBLISHERS)
      .select()
      .where('name', name)
      .first();

    if (!publisher) {
      throw RepoError.createEntityNotFoundError('publisher', name);
    }

    const id = PublisherId.create(new UniqueEntityID(publisher.id));

    const maybeCustomValues = await this.getCustomValuesByPublisherId(id);

    if (maybeCustomValues.isLeft()) {
      return left(maybeCustomValues.value);
    }

    const props = {
      dateCreated: publisher.dateCreated,
      dateUpdated: publisher.dateUpdated,
      name: publisher.name,
      id: publisher.id,
      customValues: maybeCustomValues.value,
    };

    return PublisherMap.toDomain(props);
  }

  async publisherWithIdExists(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getPublisherById(id);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }
      return left(RepoError.fromDBError(e));
    }
    return right(true);
  }

  async exists(
    publisher: Publisher
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getPublisherById(publisher.publisherId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }
      return left(RepoError.fromDBError(e));
    }
    return right(true);
  }

  async save(
    publisher: Publisher
  ): Promise<Either<GuardFailure | RepoError, Publisher>> {
    return left(
      new RepoError(RepoErrorCode.DB_ERROR, 'Save not supported for publishers')
    );
  }
}
