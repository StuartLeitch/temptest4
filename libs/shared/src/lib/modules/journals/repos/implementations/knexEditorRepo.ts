import Knex from 'knex';

import { TABLES } from '../../../../infrastructure/database/knex/index';
import { AbstractBaseDBRepo } from '../../../../infrastructure/AbstractBaseDBRepo';
import { RepoErrorCode, RepoError } from '../../../../infrastructure/RepoError';

import { JournalId } from '../../domain/JournalId';
import { Editor } from '../../domain/Editor';
import { EditorId } from '../../domain/EditorId';
import { EditorMap } from '../../mappers/EditorMap';
import { EditorRepoContract } from '../editorRepo';

export class KnexEditorRepo
  extends AbstractBaseDBRepo<Knex, Editor>
  implements EditorRepoContract {
  async getEditorListRolesByEmails(editorsEmails: string[]): Promise<Editor[]> {
    const { db } = this;

    const editors = await db(TABLES.EDITORS)
      .select()
      .whereIn('email', editorsEmails)
      .where('deleted', 0);

    return editors.map((editor) => EditorMap.toDomain(editor));
  }

  async getEditorById(editorId: EditorId): Promise<Editor> {
    const { db } = this;

    const editor = await db(TABLES.EDITORS)
      .select()
      .where('id', editorId.id.toString())
      .where('deleted', 0)
      .first();

    if (!editor) {
      throw RepoError.createEntityNotFoundError(
        'editor',
        editorId.id.toString()
      );
    }
    return EditorMap.toDomain(editor);
  }

  async exists(editor: Editor): Promise<boolean> {
    try {
      await this.getEditorById(editor.editorId);
    } catch (e) {
      if (e.code === RepoErrorCode.ENTITY_NOT_FOUND) {
        return false;
      }

      throw e;
    }

    return true;
  }

  async save(editor: Editor): Promise<Editor> {
    const { db } = this;

    const rawEditor = EditorMap.toPersistence(editor);
    const insert = db(TABLES.EDITORS).insert(rawEditor);
    const update = db
      .queryBuilder()
      .update({ ...rawEditor, deleted: 0, updatedAt: new Date() });
    try {
      await db.raw(`? ON CONFLICT (id) DO ?`, [insert, update]);
    } catch (e) {
      throw RepoError.fromDBError(e);
    }

    return this.getEditorById(editor.editorId);
  }

  async getEditorsByJournalId(journalId: JournalId): Promise<Editor[]> {
    const { db } = this;

    const editors = await db(TABLES.EDITORS)
      .select()
      .where('journalId', journalId.id.toString())
      .where('deleted', 0);

    return editors.map(EditorMap.toDomain);
  }

  async delete(editor: Editor): Promise<unknown> {
    const { db } = this;

    const deletedRows = await db(TABLES.EDITORS)
      .where('id', editor.id.toString())
      .update({
        ...EditorMap.toPersistence(editor),
        deleted: 1,
        updatedAt: new Date(),
      });

    if (!deletedRows) {
      throw RepoError.createEntityNotFoundError('editor', editor.id.toString());
    }

    return deletedRows;
  }
}
