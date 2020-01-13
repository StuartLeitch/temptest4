import { UseCaseError } from '../../../../../core/logic/UseCaseError';
import { Result } from '../../../../../core/logic/Result';

export namespace GetJournalErrors {
  export class JournalDoesntExistError extends Result<UseCaseError> {
    constructor(journalId: string) {
      super(false, {
        message: `Couldn't find Journal for id = {${journalId}}.`
      } as UseCaseError);
    }
  }
}
