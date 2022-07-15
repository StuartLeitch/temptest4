import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceDateAcceptedUpdateError extends UseCaseError {
  constructor(invoiceId: string) {
    super(
      `Couldn't not update date accepted for invoice with id: ${invoiceId}`
    );
  }
}
