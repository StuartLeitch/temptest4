import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class AuthorNotFoundError extends UseCaseError {
  constructor(authorId: string) {
    super(`Couldn't find an Author for Article id {${authorId}}.`);
  }
}

export class NoArticleForAuthor extends UseCaseError {
  constructor() {
    super('No Article provided to get Author details');
  }
}
