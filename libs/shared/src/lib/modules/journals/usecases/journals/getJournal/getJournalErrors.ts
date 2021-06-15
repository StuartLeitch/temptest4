import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class JournalDoesntExistError extends UseCaseError {
  constructor(journalId: string) {
    super(`Couldn't find Journal for id = {${journalId}}.`);
  }
}
