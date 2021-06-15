import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, left } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { EditorRole } from '../../../domain/EditorRole';
import { UserId } from '../../users/domain/UserId';
import { JournalId } from '../domain/JournalId';
import { Email } from '../../../domain/Email';
import { Name } from '../../../domain/Name';
import { Editor } from '../domain/Editor';

import { CreateEditorDTO } from '../usecases/editorialBoards/createEditor/createEditorDTO';

export class EditorMap extends Mapper<Editor> {
  public static toDomain(raw: any): Either<GuardFailure, Editor> {
    const maybeEmail = Email.create({ value: raw.email });
    const maybeName = Name.create({ value: raw.name });
    const maybeRole = EditorRole.create({
      label: raw.roleLabel,
      type: raw.roleType,
    });

    if (maybeEmail.isLeft()) {
      return left(maybeEmail.value);
    }

    if (maybeName.isLeft()) {
      return left(maybeName.value);
    }

    if (maybeRole.isLeft()) {
      return left(maybeRole.value);
    }

    return Editor.create(
      {
        journalId: JournalId.create(new UniqueEntityID(raw?.journalId)),
        userId: UserId.create(new UniqueEntityID(raw.userId)),
        email: maybeEmail.value,
        name: maybeName.value,
        createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
        updatedAt: raw.updatedAt
          ? new Date(raw.updatedAt)
          : raw.createdAt
          ? new Date(raw.createdAt)
          : null,
        role: maybeRole.value,
      },
      new UniqueEntityID(raw.id)
    );
  }

  public static toPersistence(editor: Editor): any {
    return {
      id: editor.id.toString(),
      journalId: editor.journalId.id.toString(),
      userId: editor.userId.id.toString(),
      email: editor.email.value,
      name: editor.name.value,
      roleLabel: editor.role.label,
      roleType: editor.role.type,
      createdAt: editor.createdAt,
      updatedAt: editor.updatedAt,
    };
  }

  public static fromEventToDTO(raw: any): CreateEditorDTO {
    let names = [];
    if (raw.givenNames) {
      names.push(raw.givenNames);
    }
    if (raw.surname) {
      names.push(raw.surname);
    }
    return {
      editorId: raw.id,
      journalId: raw.journalId,
      userId: raw.userId,
      email: raw.email,
      name: names.join(' '),
      createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
      updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
      roleLabel: raw.role && raw.role.label,
      roleType: raw.role && raw.role.type,
    };
  }
}
