import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetInvoicesIdsErrors {
  export class Error extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Error`
      });
    }
  }
}
