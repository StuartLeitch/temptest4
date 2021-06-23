import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find an Invoice with Invoice id {${invoiceId}}.`);
  }
}
