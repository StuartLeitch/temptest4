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
import { Editor } from '../../../domain/Editor';
import { CatalogRepoContract } from '../../../repos';
// // import { DeleteEditorDTO } from '../deleteEditor/deleteEditorDTO';
// import { DeleteEditor } from '../deleteEditor/deleteEditor';

interface GetEditorsByJournalDTO {
  journalId: string;
}

type GetEditorsByJournalResponse = Either<
  AppError.UnexpectedError | unknown,
  Editor[]
>;

export type GetEditorsByJournalAuthorizationContext = AuthorizationContext<
  Roles
>;

export class GetEditorsByJournalUsecase
  implements
    UseCase<
      GetEditorsByJournalDTO,
      Promise<GetEditorsByJournalResponse>,
      GetEditorsByJournalAuthorizationContext
    >,
    AccessControlledUsecase<
      GetEditorsByJournalDTO,
      GetEditorsByJournalAuthorizationContext,
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
    request: GetEditorsByJournalDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: GetEditorsByJournalAuthorizationContext
  ): Promise<GetEditorsByJournalResponse> {
    const { journalId: journalIdString } = request;

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

      return right(currentEditors);
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
