/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { UseCase } from '../../../../../core/domain/UseCase';
import { AppError } from '../../../../../core/logic/AppError';
import { right, Either, left } from '../../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { EditorRepoContract } from '../../../repos/editorRepo';
import { JournalId } from '../../../domain/JournalId';
import { Editor } from '../../../domain/Editor';
import { CatalogRepoContract } from '../../../repos';

interface GetEditorsByJournalDTO {
  journalId: string;
}

type GetEditorsByJournalResponse = Either<
  AppError.UnexpectedError | unknown,
  Editor[]
>;

export class GetEditorsByJournalUsecase
  implements
    UseCase<
      GetEditorsByJournalDTO,
      Promise<GetEditorsByJournalResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetEditorsByJournalDTO,
      UsecaseAuthorizationContext,
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
    context?: UsecaseAuthorizationContext
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
