import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { EditManuscriptErrors } from './editManuscriptErrors';

export type EditManuscriptResponse = Either<
  EditManuscriptErrors.ManuscriptFoundError | AppError.UnexpectedError,
  Result<Manuscript>
>;
