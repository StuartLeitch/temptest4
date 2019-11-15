import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace CreateManuscriptErrors {
  export class ManuscriptCreatedError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Can't create a new Manuscript.`
      } as UseCaseError);
    }
  }
}
