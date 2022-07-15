import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptNotFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find a Manuscript for {${manuscriptId}}.`);
  }
}
