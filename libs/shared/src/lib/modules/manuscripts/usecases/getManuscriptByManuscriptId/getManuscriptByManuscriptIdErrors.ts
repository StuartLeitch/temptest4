import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetManuscriptByManuscriptIdErrors {
  export class ManuscriptFoundError extends Result<UseCaseError> {
    constructor(manuscriptId: string) {
      super(false, {
        message: `Couldn't find a Manuscript for id = {${manuscriptId}}.`
      } as UseCaseError);
    }
  }
}
