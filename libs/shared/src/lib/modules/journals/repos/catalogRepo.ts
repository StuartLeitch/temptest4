import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { CatalogItem } from '../domain/CatalogItem';
import { CatalogPaginated } from '../domain/CatalogPaginated';
import { JournalId } from '../domain/JournalId';

export interface JournalPriceUpdate {
  journalId?: JournalId;
  amount?: number;
}

export interface CatalogRepoContract extends Repo<CatalogItem> {
  getCatalogItemByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>>;
  getCatalogItemById(
    catalogId: UniqueEntityID
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>>;
  getCatalogCollection(
    args?: any
  ): Promise<Either<GuardFailure | RepoError, CatalogPaginated>>;
  updateCatalogItem(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>>;
  bulkUpdate(
    args: Array<JournalPriceUpdate>
  ): Promise<Either<GuardFailure | RepoError, void>>;
}
