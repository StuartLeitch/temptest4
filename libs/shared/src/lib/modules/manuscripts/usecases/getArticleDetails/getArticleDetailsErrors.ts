import {UseCaseError} from '../../../../core/logic/UseCaseError';
import {Result} from '../../../../core/logic/Result';

export namespace GetArticleDetailsErrors {
  export class ArticleNotFoundError extends Result<UseCaseError> {
    constructor(articleId: string) {
      super(false, {
        message: `Couldn't find an Article with Article id {${articleId}}.`
      } as UseCaseError);
    }
  }
}
