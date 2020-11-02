import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find Manuscript for id = {${manuscriptId}}.`);
  }
}

export class InvoiceItemNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find Invoice Item for Manuscript id = {${manuscriptId}}.`);
  }
}

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceItemId: string) {
    super(`Couldn't find an Invoice for Invoice Item id = {${invoiceItemId}}.`);
  }
}

export class TransactionNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Transaction for Invoice id = {${invoiceId}}.`);
  }
}
