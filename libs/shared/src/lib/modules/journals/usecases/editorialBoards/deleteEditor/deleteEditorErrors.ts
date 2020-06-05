import { UseCaseError } from '../../../../../core/logic/UseCaseError';
// import { Either } from '../../../../../core/logic/Either';

export class JournalDoesNotExistError extends UseCaseError {
  constructor(editorId: string) {
    super(`A Journal doesn't exist for the Editor {${editorId}}.`);
  }
}
