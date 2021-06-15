import { UnexpectedError } from '../../../.././core/logic/AppError';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { Either } from '../../../../core/logic/Either';

import { Author } from './../../domain/Author';

import * as Errors from './getAuthorDetailsErrors';

export type GetAuthorDetailsResponse = Either<
  | Errors.AuthorNotFoundError
  | Errors.NoArticleForAuthor
  | UnexpectedError
  | GuardFailure,
  Author
>;
