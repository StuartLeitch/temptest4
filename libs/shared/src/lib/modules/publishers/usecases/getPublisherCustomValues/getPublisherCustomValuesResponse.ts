import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';

import { GetPublisherCustomValuesErrors } from './getPublisherCustomValuesErrors';

export type GetPublisherCustomValuesResponse = Either<
  GetPublisherCustomValuesErrors.PublisherNotFount | AppError.UnexpectedError,
  Result<PublisherCustomValues>
>;
