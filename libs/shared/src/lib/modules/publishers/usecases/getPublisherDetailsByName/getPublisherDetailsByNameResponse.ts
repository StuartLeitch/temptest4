import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetPublisherDetailsByNameErrors } from './getPublisherDetailsByNameErrors';
import { Publisher } from '../../domain/Publisher';

export type GetPublisherDetailsByNameResponse = Either<
  GetPublisherDetailsByNameErrors.PublisherNotFoundError | UnexpectedError,
  Result<Publisher>
>;
