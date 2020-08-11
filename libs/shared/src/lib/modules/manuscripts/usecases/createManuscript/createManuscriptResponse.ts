import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { CreateManuscriptErrors } from './createManuscriptErrors';

export type CreateManuscriptResponse = Either<
  CreateManuscriptErrors.ManuscriptCreatedError | UnexpectedError,
  Result<Manuscript>
>;
