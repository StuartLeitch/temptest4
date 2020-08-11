import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { EditManuscriptErrors } from './editManuscriptErrors';

export type EditManuscriptResponse = Either<
  EditManuscriptErrors.ManuscriptFoundError | UnexpectedError,
  Result<Manuscript>
>;
