/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

import { EditorRole } from '../../../domain/EditorRole';
import { Email } from '../../../domain/Email';
import { Name } from '../../../domain/Name';
import { Mapper } from '../../../infrastructure/Mapper';
import { UserId } from '../../users/domain/UserId';
import { JournalId } from '../domain/JournalId';
import { Editor } from '../domain/Editor';
import { CreateEditorDTO } from '../usecases/editorialBoards/createEditor/createEditorDTO';

export class EditorMap extends Mapper<Editor> {
  public static toDomain(raw: any): Editor {
    const editorOrError = Editor.create(
      {
        journalId: JournalId.create(
          new UniqueEntityID(raw?.journalId)
        ).getValue(),
        userId: UserId.create(new UniqueEntityID(raw.userId)),
        email: Email.create({ value: raw.email }).getValue(),
        name: Name.create({ value: raw.name }).getValue(),
        createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
        updatedAt: raw.updatedAt
          ? new Date(raw.updatedAt)
          : raw.createdAt
          ? new Date(raw.createdAt)
          : null,
        role: EditorRole.create({
          label: raw.roleLabel,
          type: raw.roleType,
        }).getValue(),
      },
      new UniqueEntityID(raw.id)
    );

    return editorOrError.isSuccess ? editorOrError.getValue() : null;
  }

  public static toPersistence(editor: Editor): any {
    return {
      id: editor.editorId.id.toString(),
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
    if (raw.givenNames) { names.push(raw.givenNames) }
    if (raw.surname) { names.push(raw.surname) }
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
