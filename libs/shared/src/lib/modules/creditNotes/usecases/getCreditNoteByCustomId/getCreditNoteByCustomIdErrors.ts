import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CreditNoteNotFoundError extends UseCaseError {
  constructor(customId: string) {
    super(`Couldn't find a Credit Note for custom ID: {${customId}}.`);
  }
}
