import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { PublisherRepoContract } from '../publisherRepo';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';
import { PublisherId } from '../../domain/PublisherId';
import { Publisher } from '../../domain/Publisher';
import { PublisherMap } from '../../mappers/PublisherMap';

export class KnexPublisherRepo
  extends AbstractBaseDBRepo<Knex, Publisher>
  implements PublisherRepoContract {
  async getCustomValuesByPublisherId(
    id: PublisherId
  ): Promise<PublisherCustomValues> {
    const emptyValues: PublisherCustomValues = {
      customSegmentId: '',
      itemId: '',
    };
    const data = await this.db(TABLES.PUBLISHER_CUSTOM_VALUES)
      .select('name', 'value')
      .where('publisherId', id.id.toString());

    if (!data.length) {
      throw RepoError.createEntityNotFoundError(
        'publisher custom values with publisher id',
        id.id.toString()
      );
    }

    return data.reduce(
      (acc: PublisherCustomValues, val: { name: string; value: string }) => {
        acc[val.name] = val.value;
        return acc;
      },
      emptyValues
    );
  }

  async getPublisherById(id: PublisherId): Promise<Publisher> {
    const publisher = await this.db(TABLES.PUBLISHERS)
      .select()
      .where('id', id.id.toString())
      .first();

    if (!publisher) {
      throw RepoError.createEntityNotFoundError('publisher', id.id.toString());
    }

    const customValues = await this.getCustomValuesByPublisherId(id);
    const props = {
      dateCreated: publisher.dateCreated,
      dateUpdated: publisher.dateUpdated,
      name: publisher.name,
      id: publisher.id,
      customValues,
    };

    return PublisherMap.toDomain(props);
  }

  async getPublisherByName(name: string): Promise<Publisher> {
    const publisher = await this.db(TABLES.PUBLISHERS)
      .select()
      .where('name', name)
      .first();

    if (!publisher) {
      throw RepoError.createEntityNotFoundError('publisher', name);
    }

    const id = PublisherId.create(new UniqueEntityID(publisher.id)).getValue();

    const customValues = await this.getCustomValuesByPublisherId(id);
    const props = {
      dateCreated: publisher.dateCreated,
      dateUpdated: publisher.dateUpdated,
      name: publisher.name,
      id: publisher.id,
      customValues,
    };

    return PublisherMap.toDomain(props);
  }

  async publisherWithIdExists(id: PublisherId): Promise<boolean> {
    try {
      await this.getPublisherById(id);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }
      throw e;
    }
    return true;
  }

  async exists(publisher: Publisher): Promise<boolean> {
    try {
      await this.getPublisherById(publisher.publisherId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }
      throw e;
    }
    return true;
  }

  async save(publisher: Publisher): Promise<Publisher> {
    throw new RepoError(
      RepoErrorCode.DB_ERROR,
      'Save not supported for publishers'
    );
  }
}
