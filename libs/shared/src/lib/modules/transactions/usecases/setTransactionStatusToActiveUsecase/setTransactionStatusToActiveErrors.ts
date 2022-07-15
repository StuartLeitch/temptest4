import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceItemNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find Invoice Item for Manuscript with id ${manuscriptId}`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceItemId: string) {
    super(`Couldn't find an Invoice with Invoice Item id {${invoiceItemId}}.`);
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `Couldn't find a Transaction to update with Invoice id {${invoiceId}}.`
    );
  }
}
