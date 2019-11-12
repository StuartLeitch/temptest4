import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace GetAuthorDetailsErrors {
  export class AuthorNotFoundError extends Result<UseCaseError> {
    constructor(authorId: string) {
      super(false, {
        message: `Couldn't find an Author with Author id {${authorId}}.`
      } as UseCaseError);
    }
  }
}
