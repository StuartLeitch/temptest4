import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PublisherPaginated } from '../../domain/PublisherPaginated';

import * as Errors from './getPublishersByPublisherIdErrors';

export type GetPublishersByPublisherIdResponse = Either<
  Errors.PublisherNotFoundError | UnexpectedError,
  PublisherPaginated
>;
