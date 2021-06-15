import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptCreatedError extends UseCaseError {
  constructor() {
    super(`Can't create a new Manuscript.`);
  }
}
