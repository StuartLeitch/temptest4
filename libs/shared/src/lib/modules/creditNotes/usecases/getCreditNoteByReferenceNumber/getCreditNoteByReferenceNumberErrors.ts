import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CreditNoteNotFoundError extends UseCaseError {
  constructor(referenceNumber: string) {
    super(
      `Couldn't find a Credit Note referencing invoice {${referenceNumber}}.`
    );
  }
}
