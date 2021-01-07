import { Repo } from '../../../infrastructure/Repo';

import { Editor } from '../domain/Editor';
import { JournalId } from '../domain/JournalId';
import { EditorId } from '../domain/EditorId';

export interface EditorRepoContract extends Repo<Editor> {
  getEditorsByJournalId(journalId: JournalId): Promise<Editor[]>;
  getEditorById(editorId: EditorId): Promise<Editor>;
  getEditorListRolesByEmails(editorsEmails: string[]): Promise<Editor[]>;
  delete(editor: Editor): Promise<unknown>;
  // update(transaction: Transaction): Promise<Transaction>;
}
