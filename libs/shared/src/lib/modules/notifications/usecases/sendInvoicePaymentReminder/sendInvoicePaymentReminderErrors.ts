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

  export class ManuscriptNotFound extends Result<UseCaseError> {
    constructor(customId: string) {
      super(false, {
        message: `No manuscript with custom id {${customId}} was found.`
      });
    }
  }

  export class EmailSendingFailure extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `Email sending has failed with error {${err}}`
      });
    }
  }
}
