import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Can't find invoice with id ${invoiceId}.`);
  }
}

export class ChangeStatusError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't update invoice with id ${invoiceId}.`);
  }
}
