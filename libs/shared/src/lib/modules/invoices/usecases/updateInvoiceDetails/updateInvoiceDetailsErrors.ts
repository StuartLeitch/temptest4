import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotUpdated extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't not update invoice with id: ${invoiceId}`);
  }
}
