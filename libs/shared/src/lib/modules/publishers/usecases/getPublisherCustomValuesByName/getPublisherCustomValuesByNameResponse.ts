import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetPublisherCustomValuesByNameErrors } from './getPublisherCustomValuesByNameErrors';
import { PublisherCustomValues } from '../../domain/PublisherCustomValues';

export type GetPublisherCustomValuesByNameResponse = Either<
  | GetPublisherCustomValuesByNameErrors.PublisherNotFound
  | AppError.UnexpectedError,
  Result<PublisherCustomValues>
>;
