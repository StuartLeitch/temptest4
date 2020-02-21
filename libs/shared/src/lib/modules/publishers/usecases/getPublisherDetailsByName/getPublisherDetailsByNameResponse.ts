import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetPublisherDetailsByNameErrors } from './getPublisherDetailsByNameErrors';
import { Publisher } from '../../domain/Publisher';

export type GetPublisherDetailsByNameResponse = Either<
  | GetPublisherDetailsByNameErrors.PublisherNotFoundError
  | AppError.UnexpectedError,
  Result<Publisher>
>;
