import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find a Manuscript for {${manuscriptId}}.`);
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
