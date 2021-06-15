import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Publisher } from '../../domain/Publisher';

import * as Errors from './getPublisherDetailsByNameErrors';

export type GetPublisherDetailsByNameResponse = Either<
  Errors.PublisherNotFoundError | UnexpectedError,
  Publisher
>;
