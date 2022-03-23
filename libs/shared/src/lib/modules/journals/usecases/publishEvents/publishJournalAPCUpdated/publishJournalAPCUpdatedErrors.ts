import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class JournalRequiredError extends UseCaseError {
  constructor() {
    super(`Journal is required`);
  }
}
