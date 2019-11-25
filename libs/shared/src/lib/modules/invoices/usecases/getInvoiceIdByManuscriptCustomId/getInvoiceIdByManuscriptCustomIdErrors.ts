import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetInvoiceIdByManuscriptCustomIdErrors {
  export class ManuscriptNotFoundError extends Result<UseCaseError> {
    constructor(customId: string) {
      super(false, {
        message: `Couldn't find an Manuscript with Custom Id {${customId}}.`
      } as UseCaseError);
    }
  }

  export class InvoiceItemNotFoundError extends Result<UseCaseError> {
    constructor(manuscriptId: string) {
      super(false, {
        message: `Couldn't find an Invoice Item associated with Manuscript Id {${manuscriptId}}.`
      } as UseCaseError);
    }
  }
}
