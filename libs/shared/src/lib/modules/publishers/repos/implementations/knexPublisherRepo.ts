import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';
import { Knex, TABLES } from '../../../../infrastructure/database/knex';

import { PublisherRepoContract } from '../publisherRepo';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';
import { PublisherId } from '../../domain/PublisherId';
import { Publisher } from '../../domain/Publisher';

export class KnexPublisherRepo extends AbstractBaseDBRepo<Knex, Publisher>
  implements PublisherRepoContract {
  async getCustomValuesByPublisherId(
    id: PublisherId
  ): Promise<PublisherCustomValues> {
    const emptyValues: PublisherCustomValues = {
      journalItemReference: '',
      tradeDocumentItem: '',
      journalReference: '',
      journalItemTag: '',
      journalTag: ''
    };
    const data = await this.db(TABLES.PUBLISHER_CUSTOM_VALUES)
      .select('name', 'value')
      .where('publisherId', id.id.toString());
    return data.reduce(
      (acc: PublisherCustomValues, val: { name: string; value: string }) => {
        acc[val.name] = val.value;
        return acc;
      },
      emptyValues
    );
  }

  async getPublisherById(id: PublisherId): Promise<Publisher> {
    return null;
  }
}
