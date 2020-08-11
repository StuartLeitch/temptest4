import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { AllEpicOnArticlePublishedErrors } from './epicOnArticlePublishedErrors';

export type EpicOnArticlePublishedResponse = Either<
  AllEpicOnArticlePublishedErrors | UnexpectedError,
  Result<void>
>;
