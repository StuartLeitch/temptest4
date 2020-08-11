import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Manuscript } from './../../domain/Manuscript';
import { MarkManuscriptAsPublishedErrors } from './markManuscriptAsPublishedErrors';

export type MarkManuscriptAsPublishedResponse = Either<
  MarkManuscriptAsPublishedErrors.ManuscriptFoundError | UnexpectedError,
  Result<Manuscript>
>;
