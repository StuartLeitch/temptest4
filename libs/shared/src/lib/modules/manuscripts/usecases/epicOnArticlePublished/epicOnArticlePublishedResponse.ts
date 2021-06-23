import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { AllEpicOnArticlePublishedErrors } from './epicOnArticlePublishedErrors';

export type EpicOnArticlePublishedResponse = Either<
  AllEpicOnArticlePublishedErrors | UnexpectedError,
  void
>;
