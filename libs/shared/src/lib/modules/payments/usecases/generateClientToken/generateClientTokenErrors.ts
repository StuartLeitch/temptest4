import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GenerateClientTokenErrors {
  export class ClientTokenNotGenerated extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `The Client Token was not successfully generated.`
      });
    }
  }
}
