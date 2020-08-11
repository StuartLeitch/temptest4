import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { GetManuscriptByManuscriptIdErrors } from './getManuscriptByManuscriptIdErrors';

export type GetManuscriptByManuscriptIdResponse = Either<
  GetManuscriptByManuscriptIdErrors.ManuscriptFoundError | UnexpectedError,
  Result<Manuscript>
>;
