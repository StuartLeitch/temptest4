import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetPublisherCustomValuesByNameErrors } from './getPublisherCustomValuesByNameErrors';
import { PublisherCustomValues } from '../../domain/PublisherCustomValues';

export type GetPublisherCustomValuesByNameResponse = Either<
  GetPublisherCustomValuesByNameErrors.PublisherNotFound | UnexpectedError,
  Result<PublisherCustomValues>
>;
