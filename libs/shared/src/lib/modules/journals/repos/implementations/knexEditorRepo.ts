import { AbstractBaseDBRepo } from 'libs/shared/src/lib/infrastructure/AbstractBaseDBRepo';
import { JournalId, Knex, TABLES } from '@hindawi/shared';
import { Editor } from '../../domain/Editor';
import { EditorRepoContract } from '../editorRepo';
import {
  RepoErrorCode,
  RepoError
} from 'libs/shared/src/lib/infrastructure/RepoError';
import { EditorMap } from '../../mappers/EditorMap';
import { EditorId } from '../../domain/EditorId';

export class KnexEditorRepo extends AbstractBaseDBRepo<Knex, Editor>
  implements EditorRepoContract {
  async getEditorById(editorId: EditorId): Promise<Editor> {
    const { db } = this;

    const editor = await db(TABLES.EDITORS)
      .select()
      .where('id', editorId.id.toString())
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

    try {
      await db(TABLES.EDITORS).insert(rawEditor);
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

    return editors.map(EditorMap.toDomain);
  }
}
