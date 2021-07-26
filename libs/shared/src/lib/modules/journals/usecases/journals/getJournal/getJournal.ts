// * Core Domain
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { CatalogRepoContract } from '../../../repos/catalogRepo';
import { CatalogItem } from '../../../domain/CatalogItem';
import { JournalId } from '../../../domain/JournalId';

import { GetJournalResponse as Response } from './getJournalResponse';
import type { GetJournalDTO as DTO } from './getJournalDTO';
import * as Errors from './getJournalErrors';

export class GetJournalUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private journalRepo: CatalogRepoContract) {
    super();
  }

  @Authorize('journal:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let journal: CatalogItem;

    const journalId = JournalId.create(new UniqueEntityID(request.journalId));

    try {
      try {
        const maybeJournal = await this.journalRepo.getCatalogItemByJournalId(
          journalId
        );

        if (maybeJournal.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeJournal.value.message))
          );
        }

        journal = maybeJournal.value;
      } catch (e) {
        return left(
          new Errors.JournalDoesntExistError(journalId.id.toString())
        );
      }

      return right(journal);
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }
}
