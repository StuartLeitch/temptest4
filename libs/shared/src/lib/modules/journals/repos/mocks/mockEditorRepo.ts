import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';

import { Editor } from '../../domain/Editor';
import { EditorId } from '../../domain/EditorId';
import { JournalId } from '../../domain/JournalId';
import { EditorRepoContract } from '../editorRepo';

export class MockEditorRepo extends BaseMockRepo<Editor>
  implements EditorRepoContract {
  constructor() {
    super();
  }

  public async getEditorById(editorId: EditorId): Promise<Editor> {
    const match = this._items.find((i) => i.editorId.equals(editorId));
    return match ? match : null;
  }

  public async getEditorCollection(): Promise<Editor[]> {
    return this._items;
  }

  public async getEditorsByJournalId(journalId: JournalId): Promise<Editor[]> {
    const match = this._items.filter((i) => i.journalId.equals(journalId));
    return match ? match : null;
  }

  public async getEditorRolesByEmail(editorEmail: string): Promise<Editor[]> {
    const match = this._items.filter((i) => i.email.value === editorEmail);
    return match ? match : null;
  }

  public async exists(editor: Editor): Promise<boolean> {
    const found = this._items.filter((e) => this.compareMockItems(e, editor));
    return found.length !== 0;
  }

  public async save(editor: Editor): Promise<Editor> {
    const alreadyExists = await this.exists(editor);

    if (alreadyExists) {
      this._items.map((e) => {
        if (this.compareMockItems(e, editor)) {
          return editor;
        } else {
          return e;
        }
      });
    } else {
      this._items.push(editor);
    }

    return editor;
  }

  public async delete(editor: Editor): Promise<void> {
    this.removeMockItem(editor);
  }

  public compareMockItems(a: Editor, b: Editor): boolean {
    return a.id.equals(b.id);
  }
}
