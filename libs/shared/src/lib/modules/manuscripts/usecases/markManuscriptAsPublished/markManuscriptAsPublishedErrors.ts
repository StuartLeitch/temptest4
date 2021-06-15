import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ManuscriptFoundError extends UseCaseError {
  constructor(manuscriptId: string) {
    super(`Couldn't find a Manuscript for id = {${manuscriptId}}.`);
  }
}
