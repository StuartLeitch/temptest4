// * Core Domain
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Left, right, left } from '../../../../../core/logic/Either';
import { UseCase } from '../../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../../domain/authorization';

import { EditorRole } from './../../../../../domain/EditorRole';
import { Email } from './../../../../../domain/Email';
import { Name } from './../../../../../domain/Name';

import { Editor, EditorProps } from '../../../domain/Editor';
import { UserId } from '../../../../users/domain/UserId';
import { JournalId } from '../../../domain/JournalId';

import { EditorRepoContract } from '../../../repos/editorRepo';

import { CreateEditorResponse as Response } from './createEditorResponse';
import { CreateEditorDTO as DTO } from './createEditorDTO';

export class CreateEditor
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private editorRepo: EditorRepoContract) {
    super();
  }

  @Authorize('editor:create')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let editor: Editor;
    let editorRole: EditorRole;
    let editorName: Name;
    let editorEmail: Email;
    let journalId: JournalId;
    let userId: UserId;

    try {
      const nameOrError = Name.create({
        value:
          request.givenNames || request.surname
            ? `${request.givenNames} ${request.surname}`
            : request.name,
      });
      if (nameOrError.isLeft()) {
        return createError(nameOrError);
      }
      editorName = nameOrError.value;

      const emailOrError = Email.create({ value: request.email });
      if (emailOrError.isLeft()) {
        return createError(emailOrError);
      }
      editorEmail = emailOrError.value;

      const editorRoleOrError = EditorRole.create({
        label: request?.role?.label || request.roleLabel,
        type: request?.role?.type || request.roleType,
      });
      if (editorRoleOrError.isLeft()) {
        return createError(editorRoleOrError);
      }
      editorRole = editorRoleOrError.value;

      const journalId = JournalId.create(new UniqueEntityID(request.journalId));

      userId = UserId.create(new UniqueEntityID(request.userId));

      const editorProps: EditorProps = {
        name: editorName,
        email: editorEmail,
        role: editorRole,
        createdAt: request.createdAt || new Date(),
        journalId,
        userId,
        updatedAt: request.updatedAt || new Date(),
      };

      const editorOrError = Editor.create(
        editorProps,
        new UniqueEntityID(request.editorId)
      );

      if (editorOrError.isLeft()) {
        return createError(editorOrError);
      }

      editor = editorOrError.value;

      await this.editorRepo.save(editor);

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}

function createError(err: Left<GuardFailure, any>): Left<UnexpectedError, any> {
  return left(new UnexpectedError(new Error(err.value.message)));
}
