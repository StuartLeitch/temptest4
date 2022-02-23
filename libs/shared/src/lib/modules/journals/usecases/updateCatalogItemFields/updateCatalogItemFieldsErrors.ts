import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CatalogNotFound extends UseCaseError {
  constructor(journalId: string) {
    super(`Couldn't find a journal with id {${journalId}}.`);
  }
}
