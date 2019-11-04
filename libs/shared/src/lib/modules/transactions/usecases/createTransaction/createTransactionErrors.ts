import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace CreateTransactionErrors {
  export class TransactionCreatedError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Can't create a new Transaction.`
      } as UseCaseError);
    }
  }

  export class InvoiceCreatedError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Can't create a new Invoice.`
      } as UseCaseError);
    }
  }

  export class InvoiceItemCreatedError extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Can't create a new Invoice Item.`
      } as UseCaseError);
    }
  }

  export class CatalogItemNotFoundError extends Result<UseCaseError> {
    constructor(journalId: string) {
      super(false, {
        message: `Couldn't find a Catalog Item for Journal id = {${journalId}}.`
      } as UseCaseError);
    }
  }
}
