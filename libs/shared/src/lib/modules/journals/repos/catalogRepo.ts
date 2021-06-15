import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { CatalogItem } from '../domain/CatalogItem';
import { JournalId } from '../domain/JournalId';

export interface CatalogRepoContract extends Repo<CatalogItem> {
  getCatalogItemByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>>;
  getCatalogItemById(
    catalogId: UniqueEntityID
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>>;
  getCatalogCollection(): Promise<
    Either<GuardFailure | RepoError, CatalogItem[]>
  >;
  updateCatalogItem(
    catalogItem: CatalogItem
  ): Promise<Either<GuardFailure | RepoError, CatalogItem>>;
}
