import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';

import { GetPublisherCustomValuesErrors } from './getPublisherCustomValuesErrors';

export type GetPublisherCustomValuesResponse = Either<
  GetPublisherCustomValuesErrors.PublisherNotFount | UnexpectedError,
  Result<PublisherCustomValues>
>;
