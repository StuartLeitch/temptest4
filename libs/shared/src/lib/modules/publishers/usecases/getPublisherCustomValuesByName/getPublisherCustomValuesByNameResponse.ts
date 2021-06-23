import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PublisherCustomValues } from '../../domain/PublisherCustomValues';

import * as Errors from './getPublisherCustomValuesByNameErrors';

export type GetPublisherCustomValuesByNameResponse = Either<
  Errors.PublisherNotFound | UnexpectedError,
  PublisherCustomValues
>;
