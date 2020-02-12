import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { MarkManuscriptAsPublishedErrors } from './markManuscriptAsPublishedErrors';

export type MarkManuscriptAsPublishedResponse = Either<
  | MarkManuscriptAsPublishedErrors.ManuscriptFoundError
  | AppError.UnexpectedError,
  Result<Manuscript>
>;
