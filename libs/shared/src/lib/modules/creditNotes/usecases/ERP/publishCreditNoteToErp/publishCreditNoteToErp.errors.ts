import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class InvoicePayersNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find Payers for the Invoice with id = ${invoiceId}`);
  }
}

export class InvoiceManuscriptNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Manuscript for the Invoice with id = ${invoiceId}`);
  }
}

export class InvoiceCatalogNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `Couldn't find a Catalog associated to the Invoice with id = ${invoiceId}`
    );
  }
}
