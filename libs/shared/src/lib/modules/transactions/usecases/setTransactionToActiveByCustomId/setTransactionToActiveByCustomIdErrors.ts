import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class TransactionNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `Couldn't find a Transaction to update with Invoice id {${invoiceId}}.`
    );
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceItemId: string) {
    super(`Couldn't find an Invoice with Invoice Item id {${invoiceItemId}}.`);
  }
}

export class InvoiceItemNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find an Invoice Item for Manuscript {${manuscriptId}}.`);
  }
}

export class CatalogItemNotFoundError extends UseCaseError {
  constructor(journalId: string) {
    super(`Couldn't find a Catalog Item for Journal id {${journalId}}.`);
  }
}

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(customId: string) {
    super(`Couldn't find a Manuscript for custom ID {${customId}}.`);
  }
}
