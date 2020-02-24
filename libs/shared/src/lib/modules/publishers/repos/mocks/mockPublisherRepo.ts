import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';
import { PublisherRepoContract } from '../publisherRepo';
import { PublisherId } from '../../domain/PublisherId';
import { Publisher } from '../../domain/Publisher';

export class MockPublisherRepo extends BaseMockRepo<Publisher>
  implements PublisherRepoContract {
  constructor() {
    super();
  }

  async getPublisherById(id: PublisherId): Promise<Publisher> {
    const match = this._items.find(item => item.id.equals(id.id));
    if (!match) {
      throw RepoError.createEntityNotFoundError('publisher', id.id.toString());
    }
    return match;
  }

  async getCustomValuesByPublisherId(
    id: PublisherId
  ): Promise<PublisherCustomValues> {
    const publisher = await this.getPublisherById(id);
    return publisher?.customValue || null;
  }

  async getPublisherByName(name: string): Promise<Publisher> {
    const match = this._items.find(item => item.name === name);
    if (!match) {
      throw RepoError.createEntityNotFoundError('publisher', name);
    }
    return match;
  }

  async publisherWithIdExists(id: PublisherId): Promise<boolean> {
    const found = this._items.find(item => item.id.equals(id.id));
    return !!found;
  }

  async exists(publisher: Publisher): Promise<boolean> {
    const found = this._items.find(item => item.id.equals(publisher.id));
    return !!found;
  }

  async save(publisher: Publisher): Promise<Publisher> {
    throw new RepoError(
      RepoErrorCode.DB_ERROR,
      'Save not supported for publishers'
    );
  }

  compareMockItems(a: Publisher, b: Publisher): boolean {
    return a.id.equals(b.id);
  }
}
