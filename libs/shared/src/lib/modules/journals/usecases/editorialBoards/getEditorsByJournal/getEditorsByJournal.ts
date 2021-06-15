import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';

import { JournalId } from '../../../domain/JournalId';

import { EditorRepoContract } from '../../../repos/editorRepo';
import { CatalogRepoContract } from '../../../repos';

import { GetEditorsByJournalResponse as Response } from './getEditorsByJournalResponse';
import { GetEditorsByJournalDTO as DTO } from './getEditorsByJournalDTO';

export class GetEditorsByJournalUsecase
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private editorRepo: EditorRepoContract,
    private catalogRepo: CatalogRepoContract
  ) {}

  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { journalId: journalIdString } = request;

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

      return right(currentEditors);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
