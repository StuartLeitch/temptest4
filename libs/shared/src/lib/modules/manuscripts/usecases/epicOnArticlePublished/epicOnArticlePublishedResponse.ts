import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { AllEpicOnArticlePublishedErrors } from './epicOnArticlePublishedErrors';

export type EpicOnArticlePublishedResponse = Either<
  AllEpicOnArticlePublishedErrors | AppError.UnexpectedError,
  Result<void>
>;
