import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class ArticleNotFoundError extends UseCaseError {
  constructor(articleId: string) {
    super(`Couldn't find an Article with Article id {${articleId}}.`);
  }
}
