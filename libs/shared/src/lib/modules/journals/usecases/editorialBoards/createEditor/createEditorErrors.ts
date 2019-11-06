import {UseCaseError} from '../../../../../core/logic/UseCaseError';
import {Result} from '../../../../../core/logic/Result';

export namespace CreateEditorErrors {
  export class JournalDoesntExistError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `A Journal doesn't exist for this Editor.`
      } as UseCaseError);
    }
  }
}
