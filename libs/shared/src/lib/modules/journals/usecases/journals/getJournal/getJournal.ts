/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../../core/domain/UseCase';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { Result, left, right } from '../../../../../core/logic/Result';
import { AppError } from '../../../../../core/logic/AppError';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { CatalogRepoContract } from '../../../repos/catalogRepo';
import { CatalogItem } from '../../../domain/CatalogItem';
import { JournalId } from '../../../domain/JournalId';

import { GetJournalDTO } from './getJournalDTO';
import { GetJournalResponse } from './getJournalResponse';
import { GetJournalErrors } from './getJournalErrors';

export class GetJournal
  implements
    UseCase<
      GetJournalDTO,
      Promise<GetJournalResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetJournalDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private journalRepo: CatalogRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: GetJournalDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<GetJournalResponse> {
    let journal: CatalogItem;

    const journalId = JournalId.create(
      new UniqueEntityID(request.journalId)
    ).getValue();

    try {
      try {
        journal = await this.journalRepo.getCatalogItemByJournalId(journalId);
      } catch (e) {
        return left(
          new GetJournalErrors.JournalDoesntExistError(journalId.id.toString())
        );
      }

      return right(Result.ok(journal));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }
}
