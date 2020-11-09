import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find Invoice for the id = ${invoiceId}`);
  }
}

export class InvoiceItemsNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find Invoice Items for the Invoice with id = ${invoiceId}`);
  }
}

export class InvoicePayersNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find Payers for the Invoice with id = ${invoiceId}`);
  }
}

export class InvoiceAddressNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find Address for the Invoice with id = ${invoiceId}`);
  }
}

export class InvoiceManuscriptNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Manuscript for the Invoice with id = ${invoiceId}`);
  }
}
