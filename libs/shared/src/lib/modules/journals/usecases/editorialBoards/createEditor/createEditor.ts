/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../../domain/authorization';

import { EditorRole } from './../../../../../domain/EditorRole';
import { Email } from './../../../../../domain/Email';
import { Name } from './../../../../../domain/Name';

import { EditorRepoContract } from '../../../repos/editorRepo';
import { Editor, EditorProps } from '../../../domain/Editor';

import { CreateEditorDTO } from './createEditorDTO';
import { CreateEditorResponse } from './createEditorResponse';
import { JournalId } from '../../../domain/JournalId';
import { UserId } from '../../../../users/domain/UserId';

export class CreateEditor
  implements
    UseCase<
      CreateEditorDTO,
      Promise<CreateEditorResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      CreateEditorDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private editorRepo: EditorRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  public async execute(
    request: CreateEditorDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<CreateEditorResponse> {
    let editor: Editor;
    let editorRole: EditorRole;
    let editorName: Name;
    let editorEmail: Email;
    let journalId: JournalId;
    let userId: UserId;

    try {
      const nameOrError = Name.create({ value: request.name });
      if (nameOrError.isFailure) {
        return left(nameOrError);
      }
      editorName = nameOrError.getValue();

      const emailOrError = Email.create({ value: request.email });
      if (emailOrError.isFailure) {
        return left(emailOrError);
      }
      editorEmail = emailOrError.getValue();

      const editorRoleOrError = EditorRole.create({
        label: request.roleLabel,
        type: request.roleType,
      });
      if (editorRoleOrError.isFailure) {
        return left(editorRoleOrError);
      }
      editorRole = editorRoleOrError.getValue();

      const journalIdOrError = JournalId.create(
        new UniqueEntityID(request.journalId)
      );
      if (journalIdOrError.isFailure) {
        return left(journalIdOrError);
      }
      journalId = journalIdOrError.getValue();

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

      if (editorOrError.isFailure) {
        return left(editorOrError);
      }

      editor = editorOrError.getValue();

      await this.editorRepo.save(editor);

      return right(Result.ok<void>());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
