import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError, RepoErrorCode } from '../../../../infrastructure/RepoError';

import { PublisherPaginated } from '../../domain/PublisherPaginated';
import { PublisherCustomValues } from '../../domain/PublisherCustomValues';
import { PublisherId } from '../../domain/PublisherId';
import { Publisher } from '../../domain/Publisher';

import { PublisherRepoContract } from '../publisherRepo';

export class MockPublisherRepo
  extends BaseMockRepo<Publisher>
  implements PublisherRepoContract {
  constructor() {
    super();
  }

  async getPublisherById(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, Publisher>> {
    const match = this._items.find((item) => item.id.equals(id.id));
    if (!match) {
      return left(
        RepoError.createEntityNotFoundError('publisher', id.id.toString())
      );
    }
    return right(match);
  }

  async getPublishersByPublisherId(): Promise<
    Either<GuardFailure | RepoError, PublisherPaginated>
  > {
    return right({
      publishers: this._items,
      totalCount: this._items.length,
    });
  }

  async getCustomValuesByPublisherId(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, PublisherCustomValues>> {
    const publisher = await this.getPublisherById(id);

    return publisher.map((p) => p.customValue);
  }

  async getPublisherByName(
    name: string
  ): Promise<Either<GuardFailure | RepoError, Publisher>> {
    const match = this._items.find((item) => item.name === name);
    if (!match) {
      return left(RepoError.createEntityNotFoundError('publisher', name));
    }
    return right(match);
  }

  async publisherWithIdExists(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.find((item) => item.id.equals(id.id));
    return right(!!found);
  }

  async exists(
    publisher: Publisher
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.find((item) => item.id.equals(publisher.id));
    return right(!!found);
  }

  async save(
    publisher: Publisher
  ): Promise<Either<GuardFailure | RepoError, Publisher>> {
    return left(
      new RepoError(RepoErrorCode.DB_ERROR, 'Save not supported for publishers')
    );
  }

  compareMockItems(a: Publisher, b: Publisher): boolean {
    return a.id.equals(b.id);
  }
}
