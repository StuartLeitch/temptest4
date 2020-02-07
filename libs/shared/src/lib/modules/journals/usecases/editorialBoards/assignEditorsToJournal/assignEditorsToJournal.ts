import { UseCase } from 'libs/shared/src/lib/core/domain/UseCase';
import {
  AccessControlledUsecase,
  AccessControlContext,
  AuthorizationContext,
  Roles
} from '@hindawi/shared';
import { EditorRepoContract } from '../../../repos/editorRepo';
import {
  left,
  right,
  Result,
  Either
} from 'libs/shared/src/lib/core/logic/Result';
import { AppError } from 'libs/shared/src/lib/core/logic/AppError';
import { JournalId } from '../../../domain/JournalId';
import { Editor } from '../../../domain/Editor';
import { CatalogRepoContract } from '../../../repos';
import { CreateEditorDTO } from '../createEditor/createEditorDTO';
import { CreateEditor } from '../createEditor/createEditor';
import { UniqueEntityID } from 'libs/shared/src/lib/core/domain/UniqueEntityID';
import { UseCaseError } from '../../../../../core/logic/UseCaseError';

interface AssignEditorsToJournalDTO {
  journalId: string;

  // when an editor is added the event contains all the editors previous to the change and the new ones
  // we have to check which editors are not present and add the entries
  allEditors: CreateEditorDTO[];
}

type AssignEditorsToJournalResponse = Either<
  AppError.UnexpectedError | Result<any>,
  Result<void>
>;

export type AssignEditorsToJournalAuthorizationContext = AuthorizationContext<
  Roles
>;

export class AssignEditorsToJournalUsecase
  implements
    UseCase<
      AssignEditorsToJournalDTO,
      Promise<AssignEditorsToJournalResponse>,
      AssignEditorsToJournalAuthorizationContext
    >,
    AccessControlledUsecase<
      AssignEditorsToJournalDTO,
      AssignEditorsToJournalAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private editorRepo: EditorRepoContract,
    private catalogRepo: CatalogRepoContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: AssignEditorsToJournalDTO,
    context?: AssignEditorsToJournalAuthorizationContext
  ): Promise<AssignEditorsToJournalResponse> {
    let { journalId: journalIdString, allEditors: editors } = request;
    let allEditors = editors.map(e => ({ ...e, journalId: journalIdString }));

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

      const currentEditors = await this.editorRepo.getEditorsByJournalId(
        journalId
      );
      if (!currentEditors) {
        return left(
          new AppError.UnexpectedError(
            `Could not get editors for journalId: ${journalId.id.toString()}.`
          )
        );
      }

      const currentEditorsIds = currentEditors.map(e => e.id.toString());

      console.log(`Current editor number: ${currentEditorsIds.length}`);
      console.log(`Expected editor number: ${allEditors.length}`);

      const editorsToCreate = allEditors.filter(e => {
        // TODO filter assistants
        const isCreated = currentEditorsIds.includes(e.editorId);
        return !isCreated;
      });

      console.log(
        `Creating ${editorsToCreate.length} editors`,
        editorsToCreate.map(e => e.email).join(' ')
      );

      const createEditorUsecase = new CreateEditor(this.editorRepo);
      let createEditorsResponse = await Promise.all(
        editorsToCreate.map(e => createEditorUsecase.execute(e))
      );

      const errs = [];
      for (const editorResponse of createEditorsResponse) {
        if (editorResponse.isLeft()) {
          errs.push(editorResponse.value);
        }
      }

      if (errs.length > 0) {
        return left(new AppError.UnexpectedError(errs));
      }

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
