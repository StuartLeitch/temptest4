/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../../core/domain/UseCase';
// import { UseCaseError } from '../../../../../core/logic/UseCaseError';
import { AppError } from '../../../../../core/logic/AppError';
import { right, Result, Either, left } from '../../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

import {
  AccessControlledUsecase,
  AccessControlContext,
  AuthorizationContext,
  Roles,
} from '@hindawi/shared';
import { EditorRepoContract } from '../../../repos/editorRepo';
import { JournalId } from '../../../domain/JournalId';
import { EditorMap } from '../../../mappers/EditorMap';
import { CatalogRepoContract } from '../../../repos';
import { DeleteEditorDTO } from '../deleteEditor/deleteEditorDTO';
// import { DeleteEditor } from '../deleteEditor/deleteEditor';

interface RemoveEditorsFromJournalDTO {
  journalId: string;

  // when an editor is added the event contains all the editors previous to the change and the new ones
  // we have to check which editors are not present and remove the entries
  allEditors: DeleteEditorDTO[];
}

type RemoveEditorsFromJournalResponse = Either<
  AppError.UnexpectedError | unknown,
  null
>;

export type RemoveEditorsFromJournalAuthorizationContext = AuthorizationContext<
  Roles
>;

export class RemoveEditorsFromJournalUsecase
  implements
    UseCase<
      RemoveEditorsFromJournalDTO,
      Promise<RemoveEditorsFromJournalResponse>,
      RemoveEditorsFromJournalAuthorizationContext
    >,
    AccessControlledUsecase<
      RemoveEditorsFromJournalDTO,
      RemoveEditorsFromJournalAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private editorRepo: EditorRepoContract,
    private catalogRepo: CatalogRepoContract
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: RemoveEditorsFromJournalDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: RemoveEditorsFromJournalAuthorizationContext
  ): Promise<RemoveEditorsFromJournalResponse> {
    const { journalId: journalIdString, allEditors: editors } = request;
    const allEditors = editors.map((e) => ({
      ...e,
      journalId: journalIdString,
    }));

    const journalId = JournalId.create(
      new UniqueEntityID(journalIdString)
    ).getValue();

    try {
      const journal = await this.catalogRepo.getCatalogItemByJournalId(
        journalId
      );
      if (!journal) {
        return left(
          new AppError.UnexpectedError(
            `Journal ${journalId.id.toString()} not found.`
          )
        );
      }

      const deleteEditorsResponse = await Promise.all(
        allEditors.map((e) => this.editorRepo.delete(EditorMap.toDomain(e)))
      );

      const errs = [];
      for (const editorResponse of deleteEditorsResponse) {
        if (typeof editorResponse !== 'undefined') {
          errs.push('Editor delete error.');
        }
      }

      if (errs.length > 0) {
        return left(new AppError.UnexpectedError(errs));
      }

      return right(null);
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
