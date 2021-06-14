import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetCreditNoteByCustomIdErrors {
  export class CreditNoteNotFoundError extends Result<UseCaseError> {
    constructor(customId: string) {
      super(false, {
        message: `Couldn't find a Credit Note for custom ID: {${customId}}.`,
      } as UseCaseError);
    }
  }
}
