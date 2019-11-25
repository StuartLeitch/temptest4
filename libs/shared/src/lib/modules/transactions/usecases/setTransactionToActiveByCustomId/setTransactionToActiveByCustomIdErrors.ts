import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace SetTransactionToActiveByCustomIdErrors {
  export class TransactionNotFoundError extends Result<UseCaseError> {
    constructor(invoiceId: string) {
      super(false, {
        message: `Couldn't find a Transaction to update with Invoice id {${invoiceId}}.`
      } as UseCaseError);
    }
  }

  export class InvoiceNotFoundError extends Result<UseCaseError> {
    constructor(invoiceItemId: string) {
      super(false, {
        message: `Couldn't find an Invoice with Invoice Item id {${invoiceItemId}}.`
      } as UseCaseError);
    }
  }

  export class InvoiceItemNotFoundError extends Result<UseCaseError> {
    constructor(manuscriptId: string) {
      super(false, {
        message: `Couldn't find an Invoice Item for Manuscript {${manuscriptId}}.`
      } as UseCaseError);
    }
  }

  export class CatalogItemNotFoundError extends Result<UseCaseError> {
    constructor(journalId: string) {
      super(false, {
        message: `Couldn't find a Catalog Item for Journal id {${journalId}}.`
      } as UseCaseError);
    }
  }

  export class ManuscriptNotFoundError extends Result<UseCaseError> {
    constructor(customId: string) {
      super(false, {
        message: `Couldn't find a Manuscript for custom ID {${customId}}.`
      } as UseCaseError);
    }
  }
}
