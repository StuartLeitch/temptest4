import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetCreditNoteByIdErrors {
  export class CreditNoteNotFoundError extends Result<UseCaseError> {
    constructor(creditNoteId: string) {
      super(false, {
        message: `Couldn't find a Credit Note for id {${creditNoteId}}.`,
      } as UseCaseError);
    }
  }
}
