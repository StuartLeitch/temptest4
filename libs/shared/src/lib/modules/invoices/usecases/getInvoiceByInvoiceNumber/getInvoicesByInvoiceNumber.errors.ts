import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceNumber: string) {
    super(
      `Couldn't find an Invoice Item associated with Manuscript Id {${invoiceNumber}}.`
    );
  }
}
