import { UseCaseError } from '../../../../../core/logic/UseCaseError';

export class JournalDoesntExistError extends UseCaseError {
  constructor() {
    super(`A Journal doesn't exist for this Editor.`);
  }
}
