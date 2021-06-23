import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Manuscript } from './../../domain/Manuscript';

import * as Errors from './markManuscriptAsPublishedErrors';

export type MarkManuscriptAsPublishedResponse = Either<
  Errors.ManuscriptFoundError | UnexpectedError,
  Manuscript
>;
