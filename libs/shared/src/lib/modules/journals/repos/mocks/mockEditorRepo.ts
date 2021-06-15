import { BaseMockRepo } from '../../../../core/tests/mocks/BaseMockRepo';
import { Either, right, left } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';

import { RepoError } from '../../../../infrastructure/RepoError';

import { JournalId } from '../../domain/JournalId';
import { EditorId } from '../../domain/EditorId';
import { Editor } from '../../domain/Editor';

import { EditorRepoContract } from '../editorRepo';

export class MockEditorRepo
  extends BaseMockRepo<Editor>
  implements EditorRepoContract {
  constructor() {
    super();
  }

  public async getEditorById(
    editorId: EditorId
  ): Promise<Either<GuardFailure | RepoError, Editor>> {
    const match = this._items.find((i) => i.editorId.equals(editorId));
    return right(match);
  }

  public async getEditorCollection(): Promise<Editor[]> {
    return this._items;
  }

  public async getEditorsByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, Editor[]>> {
    const match = this._items.filter((e) => e.journalId.equals(journalId));
    return right(match);
  }

  public async getEditorListRolesByEmails(
    editorsEmails: string[]
  ): Promise<Either<GuardFailure | RepoError, Editor[]>> {
    const match = this._items.filter((i) =>
      editorsEmails.includes(i.email.value)
    );
    return right(match);
  }

  public async exists(
    editor: Editor
  ): Promise<Either<GuardFailure | RepoError, boolean>> {
    const found = this._items.filter((e) => this.compareMockItems(e, editor));
    return right(found.length !== 0);
  }

  public async save(
    editor: Editor
  ): Promise<Either<GuardFailure | RepoError, Editor>> {
    const maybeAlreadyExists = await this.exists(editor);

    if (maybeAlreadyExists.isLeft()) {
      return left(
        RepoError.fromDBError(new Error(maybeAlreadyExists.value.message))
      );
    }

    const alreadyExists = maybeAlreadyExists.value;

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

    return right(editor);
  }

  public async delete(
    editor: Editor
  ): Promise<Either<GuardFailure | RepoError, void>> {
    this.removeMockItem(editor);

    return right(null);
  }

  public compareMockItems(a: Editor, b: Editor): boolean {
    return a.id.equals(b.id);
  }
}
