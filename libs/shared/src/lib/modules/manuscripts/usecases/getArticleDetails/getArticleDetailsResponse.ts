import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { GetArticleDetailsErrors } from './getArticleDetailsErrors';
import { Article } from './../../domain/Article';

export type GetArticleDetailsResponse = Either<
  GetArticleDetailsErrors.ArticleNotFoundError | UnexpectedError,
  Result<Article>
>;
