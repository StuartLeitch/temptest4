// * Core Domain
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { EditorId } from '../../../domain/EditorId';
import { Editor } from '../../../domain/Editor';

import { EditorRepoContract } from '../../../repos/editorRepo';

import { DeleteEditorResponse as Response } from './deleteEditorResponse';
import { DeleteEditorDTO as DTO } from './deleteEditorDTO';

export class DeleteEditor
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private editorRepo: EditorRepoContract) {
    super();
  }

  @Authorize('editor:delete')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let editor: Editor;

    const { editorId } = request;

    try {
      const maybeEditor = await this.editorRepo.getEditorById(
        EditorId.create(new UniqueEntityID(editorId))
      );

      if (maybeEditor.isLeft()) {
        return left(new UnexpectedError(new Error(maybeEditor.value.message)));
      }

      editor = maybeEditor.value;

      // * This is where all the magic happens
      await this.editorRepo.delete(editor);

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
