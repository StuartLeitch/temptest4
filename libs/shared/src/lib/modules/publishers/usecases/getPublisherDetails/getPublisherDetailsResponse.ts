import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetPublisherDetailsErrors } from './getPublisherDetailsErrors';
import { Publisher } from '../../domain/Publisher';

export type GetPublisherDetailsResponse = Either<
  GetPublisherDetailsErrors.PublisherNotFoundError | AppError.UnexpectedError,
  Result<Publisher>
>;
