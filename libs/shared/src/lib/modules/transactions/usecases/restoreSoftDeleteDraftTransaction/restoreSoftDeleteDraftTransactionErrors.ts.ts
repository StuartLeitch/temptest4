import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace RestoreSoftDeleteDraftTransactionErrors {
  export class ManuscriptNotFoundError extends Result<UseCaseError> {
    constructor(manuscriptId: string) {
      super(false, {
        message: `Couldn't find Manuscript for id = {${manuscriptId}}.`,
      } as UseCaseError);
    }
  }

  export class InvoiceItemNotFoundError extends Result<UseCaseError> {
    constructor(manuscriptId: string) {
      super(false, {
        message: `Couldn't find an Invoice Item for Manuscript id = {${manuscriptId}}.`,
      } as UseCaseError);
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceItemId: string) {
      super(false, {
        message: `Couldn't find an Invoice for Invoice Item id = {${invoiceItemId}}.`,
      } as UseCaseError);
    }
  }

  export class TransactionNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find a Transaction for Invoice id = {${invoiceId}}.`,
      } as UseCaseError);
    }
  }
}
