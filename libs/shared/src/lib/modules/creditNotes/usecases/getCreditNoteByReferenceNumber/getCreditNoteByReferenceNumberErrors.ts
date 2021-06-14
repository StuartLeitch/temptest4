import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetCreditNoteByReferenceNumberErrors {
  export class CreditNoteNotFoundError extends Result<UseCaseError> {
    constructor(referenceNumber: string) {
      super(false, {
        message: `Couldn't find a Credit Note referencing invoice {${referenceNumber}}.`,
      } as UseCaseError);
    }
  }
}
