import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CreditNoteNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Couldn't find a Credit Note referencing invoice {${invoiceId}}.`);
  }
}
