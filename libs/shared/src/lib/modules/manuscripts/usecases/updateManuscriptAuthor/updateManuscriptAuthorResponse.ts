import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';
import * as Errors from './updateManuscriptAuthorErrors';

export type UpdateManuscriptAuthorResponse = Either<
  Errors.ManuscriptNotFoundError | UnexpectedError,
  void
>;
