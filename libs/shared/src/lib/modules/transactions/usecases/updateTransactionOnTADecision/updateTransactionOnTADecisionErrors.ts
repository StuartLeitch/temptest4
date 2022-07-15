import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceItemId: string) {
    super(`Couldn't find an Invoice with Invoice Item id {${invoiceItemId}}.`);
  }
}

export class TransactionNotUpdatedError extends UseCaseError {
  constructor() {
    super('Could not update Transaction status.');
  }
}

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Could not find Manuscript for id: ${invoiceId}`);
  }
}

export class CatalogItemNotFoundError extends UseCaseError {
  constructor(journalId: string) {
    super(`Couldn't find a Catalog Item for Journal id {${journalId}}.`);
  }
}

export class InvoiceItemNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find an Invoice Item for Manuscript {${manuscriptId}}.`);
  }
}
