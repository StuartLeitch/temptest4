import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { GetArticleDetailsErrors } from './getArticleDetailsErrors';
import { Article } from './../../domain/Article';

export type GetArticleDetailsResponse = Either<
  GetArticleDetailsErrors.ArticleNotFoundError | AppError.UnexpectedError,
  Result<Article>
>;
