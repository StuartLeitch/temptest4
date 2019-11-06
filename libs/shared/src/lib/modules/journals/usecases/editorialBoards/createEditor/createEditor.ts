// * Core Domain
import {UseCase} from '../../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../../core/logic/Result';
import {AppError} from '../../../../../core/logic/AppError';

import {EditorRole} from './../../../../../domain/EditorRole';
import {Email} from './../../../../../domain/Email';
import {Name} from './../../../../../domain/Name';

import {EditorRepoContract} from '../../../repos/editorRepo';
import {Editor, EditorProps} from '../../../domain/Editor';

import {CreateEditorDTO} from './createEditorDTO';
import {CreateEditorResponse} from './createEditorResponse';
import {
  AccessControlContext,
  AccessControlledUsecase,
  CreateEditorAuthorizationContext
} from './createEditorAuthorizationContext';

export class CreateEditor
  implements
    UseCase<
      CreateEditorDTO,
      Promise<CreateEditorResponse>,
      CreateEditorAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateEditorDTO,
      CreateEditorAuthorizationContext,
      AccessControlContext
    > {
  constructor(private editorRepo: EditorRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: CreateEditorDTO,
    context?: CreateEditorAuthorizationContext
  ): Promise<CreateEditorResponse> {
    let editor: Editor;
    let editorRole: EditorRole;
    let editorName: Name;
    let editorEmail: Email;

    try {
      const nameOrError = Name.create({value: request.name});
      if (nameOrError.isFailure) {
        return left(nameOrError);
      }
      editorName = nameOrError.getValue();

      const emailOrError = Email.create({value: request.email});
      if (emailOrError.isFailure) {
        return left(emailOrError);
      }
      editorEmail = emailOrError.getValue();

      const editorRoleOrError = EditorRole.create({
        label: request.roleLabel,
        type: request.roleType
      });
      if (editorRoleOrError.isFailure) {
        return left(editorRoleOrError);
      }
      editorRole = editorRoleOrError.getValue();

      const editorProps: EditorProps = {
        name: editorName,
        email: editorEmail,
        role: editorRole
      };

      const editorOrError = Editor.create(editorProps);

      if (editorOrError.isFailure) {
        return left(editorOrError);
      }

      editor = editorOrError.getValue();

      await this.editorRepo.save(editor);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
