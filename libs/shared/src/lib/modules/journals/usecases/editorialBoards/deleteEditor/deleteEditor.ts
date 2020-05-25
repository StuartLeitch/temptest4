// * Core Domain
import { UseCase } from '../../../../../core/domain/UseCase';
import { left, right } from '../../../../../core/logic/Either';
import { AppError } from '../../../../../core/logic/AppError';
// import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

// import { EditorRole } from '../../../../../domain/EditorRole';
// import { Email } from '../../../../../domain/Email';
// import { Name } from '../../../../../domain/Name';

import { EditorRepoContract } from '../../../repos/editorRepo';
import { Editor } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';

import { DeleteEditorDTO } from './deleteEditorDTO';
import { DeleteEditorResponse } from './deleteEditorResponse';
import {
  AccessControlContext,
  AccessControlledUsecase,
  DeleteEditorAuthorizationContext,
} from './deleteEditorAuthorizationContext';
// import { JournalId } from '../../../domain/JournalId';
// import { UserId } from '../../../../../modules/users/domain/UserId';

export class DeleteEditor
  implements
    UseCase<
      DeleteEditorDTO,
      Promise<DeleteEditorResponse>,
      DeleteEditorAuthorizationContext
    >,
    AccessControlledUsecase<
      DeleteEditorDTO,
      DeleteEditorAuthorizationContext,
      AccessControlContext
    > {
  constructor(private editorRepo: EditorRepoContract) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: DeleteEditorDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: DeleteEditorAuthorizationContext
  ): Promise<DeleteEditorResponse> {
    let editor: Editor;

    try {
      editor = EditorMap.toDomain(request);

      // * This is where all the magic happens
      await this.editorRepo.delete(editor);

      return right(null);
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
