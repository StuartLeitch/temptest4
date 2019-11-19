import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { CreateManuscriptErrors } from './createManuscriptErrors';

export type CreateManuscriptResponse = Either<
  CreateManuscriptErrors.ManuscriptCreatedError | AppError.UnexpectedError,
  Result<Manuscript>
>;