import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Manuscript } from './../../domain/Manuscript';

import * as Errors from './createManuscriptErrors';

export type CreateManuscriptResponse = Either<
  Errors.ManuscriptCreatedError | UnexpectedError,
  Manuscript
>;
