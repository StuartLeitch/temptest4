import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export namespace GetAuthorDetailsErrors {
  export class AuthorNotFoundError extends Result<UseCaseError> {
    constructor(authorId: string) {
      super(false, {
        message: `Couldn't find an Author for Article id {${authorId}}.`
      } as UseCaseError);
    }
  }

  export class NoArticleForAuthor extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: 'No Article provided to get Author details'
      });
    }
  }
}
