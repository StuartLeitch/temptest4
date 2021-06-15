import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';

import * as Errors from './getPublisherCustomValuesErrors';

export type GetPublisherCustomValuesResponse = Either<
  Errors.PublisherNotFount | UnexpectedError,
  PublisherCustomValues
>;
