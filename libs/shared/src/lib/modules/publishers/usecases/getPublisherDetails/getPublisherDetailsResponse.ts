import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Publisher } from '../../domain/Publisher';

import * as Errors from './getPublisherDetailsErrors';

export type GetPublisherDetailsResponse = Either<
  Errors.PublisherNotFoundError | UnexpectedError,
  Publisher
>;
