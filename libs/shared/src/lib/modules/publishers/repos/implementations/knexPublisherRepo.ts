import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';
import { PublisherId } from '../../domain/PublisherId';
import { Publisher } from '../../domain/Publisher';

import { PublisherMap } from '../../mappers/PublisherMap';

import { PublisherRepoContract } from '../publisherRepo';

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
