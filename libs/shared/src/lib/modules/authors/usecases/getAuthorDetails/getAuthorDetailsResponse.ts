import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { GetAuthorDetailsErrors } from './getAuthorDetailsErrors';
import { Author } from './../../domain/Author';

export type GetAuthorDetailsResponse = Either<
  | GetAuthorDetailsErrors.AuthorNotFoundError
  | GetAuthorDetailsErrors.NoArticleForAuthor
  | AppError.UnexpectedError,
  Result<Author>
>;
