import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { RepoError } from '../../../infrastructure/RepoError';
import { Repo } from '../../../infrastructure/Repo';

import { Editor } from '../domain/Editor';
import { JournalId } from '../domain/JournalId';
import { EditorId } from '../domain/EditorId';

export interface EditorRepoContract extends Repo<Editor> {
  getEditorsByJournalId(
    journalId: JournalId
  ): Promise<Either<GuardFailure | RepoError, Editor[]>>;
  getEditorById(
    editorId: EditorId
  ): Promise<Either<GuardFailure | RepoError, Editor>>;
  getEditorListRolesByEmails(
    editorsEmails: string[]
  ): Promise<Either<GuardFailure | RepoError, Editor[]>>;
  delete(editor: Editor): Promise<Either<GuardFailure | RepoError, void>>;
}
