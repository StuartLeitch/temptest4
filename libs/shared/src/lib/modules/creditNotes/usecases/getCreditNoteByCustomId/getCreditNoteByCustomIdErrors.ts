import { UseCaseError } from '../../../../core/logic/UseCaseError';

export namespace GetCreditNoteByCustomIdErrors {
  export class CreditNoteNotFoundError extends UseCaseError {
    constructor(customId: string) {
      super(`Couldn't find a Credit Note for custom ID: {${customId}}.`);
    }
  }
}
