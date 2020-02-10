// * Core Domain
import { UseCase } from '../../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../../core/logic/Result';
import { AppError } from '../../../../../core/logic/AppError';

import { CatalogItem } from '../../../domain/CatalogItem';
import { CatalogRepoContract } from '../../../repos/catalogRepo';

// * Usecase specifics
import { GetJournalListResponse } from './getJournalListResponse';
import { GetJournalListDTO } from './getJournalListDTO';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  AccessControlContext,
  GetJournalListAuthenticationContext
} from './getJournalListAuthenticationContext';

export class GetJournalListUsecase
  implements
    UseCase<
      GetJournalListDTO,
      Promise<GetJournalListResponse>,
      GetJournalListAuthenticationContext
    >,
    AccessControlledUsecase<
      GetJournalListDTO,
      GetJournalListAuthenticationContext,
      AccessControlContext
    > {
  constructor(private journalRepo: CatalogRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('journal:read')
  public async execute(
    request: GetJournalListDTO,
    context?: GetJournalListAuthenticationContext
  ): Promise<GetJournalListResponse> {
    try {
      const result = await this.journalRepo.getCatalogCollection();
      return right(Result.ok<CatalogItem[]>(result));
    } catch (err) {
      return left(
        new AppError.UnexpectedError(
          err, 'Getting journal list failed'
        )
      );
    }
  }
}
