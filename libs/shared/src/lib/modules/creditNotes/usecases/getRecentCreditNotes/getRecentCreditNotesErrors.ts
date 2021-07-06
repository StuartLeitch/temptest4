import { UseCaseError } from '../../../../core/logic/UseCaseError';

export namespace GetRecentCreditNotesErrors {
  export class CreditNotesListFailure extends UseCaseError {
    constructor(err: Error) {
      super(
        `Getting recent credit notes has failed: ${err.message}: ${err.stack}`
      );
    }
  }
}
