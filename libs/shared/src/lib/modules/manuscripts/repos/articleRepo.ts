import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { ManuscriptId } from '../../manuscripts/domain/ManuscriptId';
import { Manuscript } from '../domain/Manuscript';
import { Article } from '../domain/Article';

export interface ArticleRepoContract extends Repo<Article | Manuscript> {
  findById(manuscriptId: ManuscriptId): Promise<Either<GuardFailure | RepoError, Article | Manuscript>>;
  findByCustomId(customId: ManuscriptId | string): Promise<Either<GuardFailure | RepoError, Article | Manuscript>>;
  delete(manuscript: Manuscript): Promise<Either<GuardFailure | RepoError, void>>;
  restore(manuscript: Manuscript): Promise<Either<GuardFailure | RepoError, void>>;
  update(manuscript: Manuscript): Promise<Either<GuardFailure | RepoError, Manuscript>>;
  filterBy(criteria: any): any;
  updateManuscriptTAApproval(
    manuscriptId: ManuscriptId,
    isApproved: boolean
  ): Promise<Either<GuardFailure | RepoError, Manuscript>>;

  updateManuscriptTAEligibility(
    manuscriptId: ManuscriptId,
    isEligible: boolean
  ): Promise<Either<GuardFailure | RepoError, Manuscript>>;
}
