import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Manuscript } from './../../domain/Manuscript';
import * as Errors from './editManuscriptErrors';

export type EditManuscriptResponse = Either<
  | Errors.ManuscriptUpdateDbError
  | Errors.ManuscriptFoundError
  | UnexpectedError,
  Manuscript
>;
