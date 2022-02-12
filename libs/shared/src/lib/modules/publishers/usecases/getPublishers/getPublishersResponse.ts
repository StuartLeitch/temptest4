import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PublisherPaginated } from '../../domain/PublisherPaginated';

import * as Errors from './getPublishersErrors';

export type GetPublishersResponse = Either<
  Errors.PublisherNotFoundError | UnexpectedError,
  PublisherPaginated
>;
