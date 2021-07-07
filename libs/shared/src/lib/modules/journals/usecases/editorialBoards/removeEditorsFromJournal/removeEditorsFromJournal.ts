import { Either, flatten, right, left } from '../../../../../core/logic/Either';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UseCase } from '../../../../../core/domain/UseCase';

import { RepoError } from '../../../../../infrastructure/RepoError';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { JournalId } from '../../../domain/JournalId';

import { EditorMap } from '../../../mappers/EditorMap';

import { EditorRepoContract } from '../../../repos/editorRepo';
import { CatalogRepoContract } from '../../../repos';

import { RemoveEditorsFromJournalResponse as Response } from './removeEditorsFromJournalResponse';
import type { RemoveEditorsFromJournalDTO as DTO } from './removeEditorsFromJournalDTO';

export class RemoveEditorsFromJournalUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private editorRepo: EditorRepoContract,
    private catalogRepo: CatalogRepoContract
  ) {
    super();
  }

  @Authorize('editor:assign')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { journalId: journalIdString, allEditors: editors } = request;
    const allEditors = editors.map((e) => ({
      ...e,
      journalId: journalIdString,
    }));

    const journalId = JournalId.create(new UniqueEntityID(journalIdString));

    try {
      const journal = await this.catalogRepo.getCatalogItemByJournalId(
        journalId
      );
      if (!journal) {
        return left(
          new UnexpectedError(
            new Error(`Journal ${journalId.id.toString()} not found.`)
          )
        );
      }

      try {
        const maybeResults = await Promise.all(
          allEditors.map(
            (e): Promise<Either<GuardFailure | RepoError, void>> => {
              const maybeEditor = EditorMap.toDomain(e);

              if (maybeEditor.isLeft()) {
                return Promise.resolve(left(maybeEditor.value));
              }

              return this.editorRepo.delete(maybeEditor.value);
            }
          )
        );

        const result = flatten(maybeResults);

        if (result.isLeft()) {
          return left(new UnexpectedError(new Error(result.value.message)));
        }
      } catch (errors) {
        const errs = [];
        for (const editorResponse of errors) {
          if (typeof editorResponse !== 'undefined') {
            errs.push('Editor delete error.');
          }
        }

        if (errs.length > 0) {
          return left(new UnexpectedError(errs));
        }
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
