import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace SendInvoicePaymentReminderErrors {
  export class ManuscriptCustomIdRequired extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Manuscript custom id is required.`
      });
    }
  }
}
