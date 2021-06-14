import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetRecentCreditNotesErrors {
  export class CreditNotesListFailure extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `Getting recent credit notes has failed: ${err.message}: ${err.stack}`,
      } as UseCaseError);
    }
  }
}
