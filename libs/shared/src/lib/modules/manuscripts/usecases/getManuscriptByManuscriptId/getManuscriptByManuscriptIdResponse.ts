import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { GetManuscriptByManuscriptIdErrors } from './getManuscriptByManuscriptIdErrors';

export type GetManuscriptByManuscriptIdResponse = Either<
  | GetManuscriptByManuscriptIdErrors.ManuscriptFoundError
  | AppError.UnexpectedError,
  Result<Manuscript>
>;
