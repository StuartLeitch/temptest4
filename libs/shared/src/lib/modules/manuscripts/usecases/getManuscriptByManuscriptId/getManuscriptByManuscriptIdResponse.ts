import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Manuscript } from './../../domain/Manuscript';

import * as Errors from './getManuscriptByManuscriptIdErrors';

export type GetManuscriptByManuscriptIdResponse = Either<
  Errors.ManuscriptFoundError | UnexpectedError,
  Manuscript
>;
