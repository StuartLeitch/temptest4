import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Article } from './../../domain/Article';

import * as Errors from './getArticleDetailsErrors';

export type GetArticleDetailsResponse = Either<
  Errors.ArticleNotFoundError | UnexpectedError,
  Article
>;
