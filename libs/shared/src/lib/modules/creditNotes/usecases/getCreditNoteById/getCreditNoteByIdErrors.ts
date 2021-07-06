import { UseCaseError } from '../../../../core/logic/UseCaseError';

export namespace GetCreditNoteByIdErrors {
  export class CreditNoteNotFoundError extends UseCaseError {
    constructor(creditNoteId: string) {
      super(`Couldn't find a Credit Note for id {${creditNoteId}}.`);
    }
  }
}
