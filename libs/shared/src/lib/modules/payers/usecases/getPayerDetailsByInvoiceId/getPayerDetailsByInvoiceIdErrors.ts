import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetPayerDetailsByInvoiceIdErrors {
  export class InvoiceIdRequiredError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Invoice id is required.`
      });
    }
  }

  export class NoPayerFoundForInvoiceError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `No payer found for invoice with id {${invoiceId}}.`
      });
    }
  }

  export class FetchPayerFromDbError extends Result<UseCaseError> {
    constructor(err: Error) {
      super(false, {
        message: `While fetching the payer from the db an error ocurred: ${err.message}`
      });
    }
  }
}
