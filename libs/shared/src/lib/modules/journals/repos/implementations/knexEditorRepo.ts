import Knex from 'knex';

import { Either, flatten, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';
import { TABLES } from '../../../../infrastructure/database/knex/index';

import { JournalId } from '../../domain/JournalId';
import { EditorId } from '../../domain/EditorId';
import { Editor } from '../../domain/Editor';

import { EditorMap } from '../../mappers/EditorMap';

import { EditorRepoContract } from '../editorRepo';

export class KnexEditorRepo
  extends AbstractBaseDBRepo<Knex, Editor>
  implements EditorRepoContract {
  async getEditorListRolesByEmails(
    editorsEmails: string[]
  ): Promise<Either<GuardFailure | RepoError, Editor[]>> {
    const { db } = this;

    const editors = await db(TABLES.EDITORS)
      .select()
      .whereIn('email', editorsEmails)
      .where('deleted', 0);

    return flatten(editors.map((editor) => EditorMap.toDomain(editor)));
  }

  async getEditorById(
    editorId: EditorId
  ): Promise<Either<GuardFailure | RepoError, Editor>> {
    const { db } = this;

    const editor = await db(TABLES.EDITORS)
      .select()
      .where('id', editorId.id.toString())
      .where('deleted', 0)
      .first();

    if (!editor) {
      return left(
        RepoError.createEntityNotFoundError('editor', editorId.id.toString())
      );
    }
    return EditorMap.toDomain(editor);
  }

  async exists(
    editor: Editor
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    try {
      await this.getEditorById(editor.editorId);
      return right(true);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return right(false);
      }

      return left(RepoError.fromDBError(e));
    }
  }

  async save(
    editor: Editor
  ): Promise<Either<GuardFailure | RepoError, Editor>> {
    const { db } = this;

    const rawEditor = EditorMap.toPersistence(editor);
    const insert = db(TABLES.EDITORS).insert(rawEditor);
    const update = db
      .queryBuilder()
      .update({ ...rawEditor, deleted: 0, updatedAt: new Date() });
    try {
      await db.raw(`? ON CONFLICT (id) DO ?`, [insert, update]);
    } catch (e) {
      return left(RepoError.fromDBError(e));
    }

    return this.getEditorById(editor.editorId);
  }

  async getEditorsByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, Editor[]>> {
    const { db } = this;

    const editors = await db(TABLES.EDITORS)
      .select()
      .where('journalId', journalId.id.toString())
      .where('deleted', 0);

    return flatten(editors.map(EditorMap.toDomain));
  }

  async delete(
    editor: Editor
  ): Promise<Either<GuardFailure | RepoError, void>> {
    const { db } = this;

    const deletedRows = await db(TABLES.EDITORS)
      .where('id', editor.id.toString())
      .update({
        ...EditorMap.toPersistence(editor),
        deleted: 1,
        updatedAt: new Date(),
      });

    if (!deletedRows) {
      return left(
        RepoError.createEntityNotFoundError('editor', editor.id.toString())
      );
    }

    return right(null);
  }
}
