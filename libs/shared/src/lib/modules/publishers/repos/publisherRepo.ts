import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { PublisherCustomValues } from '../domain/PublisherCustomValues';
import { PublisherId } from '../domain/PublisherId';
import { Publisher } from '../domain/Publisher';
import { PublisherPaginated } from '../domain/PublisherPaginated';

export interface PublisherRepoContract extends Repo<Publisher> {
  getPublishers(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, PublisherPaginated>>;
  getCustomValuesByPublisherId(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, PublisherCustomValues>>;
  getPublisherById(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, Publisher>>;
  getPublisherByName(
    name: string
  ): Promise<Either<GuardFailure | RepoError, Publisher>>;
  publisherWithIdExists(
    id: PublisherId
  ): Promise<Either<GuardFailure | RepoError, boolean>>;
  getPublishersByPublisherId(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, PublisherPaginated>>;
}
