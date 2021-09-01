import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CreditNoteIdRequiredError extends UseCaseError {
  constructor() {
    super(`Credit Note id is required.`);
  }
}
