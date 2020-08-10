/* eslint-disable @typescript-eslint/no-namespace */
import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace CreateCreditNoteErrors {
  export class TransactionNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find a Transaction for {${invoiceId}}.`,
      } as UseCaseError);
    }
  }
  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find a Invoice for {${invoiceId}}.`,
      } as UseCaseError);
    }
  }

  export class InvoiceIsDraftError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Invoice with id {${invoiceId}} is still in "DRAFT" status and cannot have a credit note created`,
      });
    }
  }
}
