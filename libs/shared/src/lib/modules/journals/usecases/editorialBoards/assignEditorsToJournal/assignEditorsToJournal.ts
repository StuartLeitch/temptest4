import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { JournalId } from '../../../domain/JournalId';

import { EditorRepoContract } from '../../../repos/editorRepo';
import { CatalogRepoContract } from '../../../repos';

import { CreateEditor } from '../createEditor/createEditor';

import { AssignEditorsToJournalResponse as Response } from './assignEditorsToJournalResponse';
import { AssignEditorsToJournalDTO as DTO } from './assignEditorsToJournalDTO';

export class AssignEditorsToJournalUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private editorRepo: EditorRepoContract,
    private catalogRepo: CatalogRepoContract
  ) {}

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

      const maybeCurrentEditors = await this.editorRepo.getEditorsByJournalId(
        journalId
      );

      if (maybeCurrentEditors.isLeft()) {
        return left(
          new UnexpectedError(new Error(maybeCurrentEditors.value.message))
        );
      }

      const currentEditors = maybeCurrentEditors.value;

      if (!currentEditors) {
        return left(
          new UnexpectedError(
            new Error(
              `Could not get editors for journalId: ${journalId.id.toString()}.`
            )
          )
        );
      }

      const currentEditorsIds = currentEditors.map((e) => e.id.toString());

      const editorsToCreate = allEditors.filter((e) => {
        // TODO filter assistants
        const isCreated = currentEditorsIds.includes(e.editorId);
        return !isCreated;
      });

      const createEditorUsecase = new CreateEditor(this.editorRepo);
      const createEditorsResponse = await Promise.all(
        editorsToCreate.map((e) => createEditorUsecase.execute(e))
      );

      const errs = [];
      for (const editorResponse of createEditorsResponse) {
        if (editorResponse.isLeft()) {
          errs.push(editorResponse.value);
        }
      }

      if (errs.length > 0) {
        return left(new UnexpectedError(errs));
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
