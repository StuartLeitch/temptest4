import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetManuscriptByInvoiceIdErrors {
  export class NoApcForInvoice extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `No APC found for invoice with id {${invoiceId}}`
      });
    }
  }

  export class InvalidInvoiceId extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `The invoice id {${invoiceId}} is invalid`
      });
    }
  }

  export class ApcHasNoManuscript extends Result<UseCaseError> {
    constructor(apcId: string, invoiceId: string) {
      super(false, {
        message: `The APC with id {${apcId}} from invoice with id {${invoiceId}} has no manuscript tied to it`
      });
    }
  }
}
