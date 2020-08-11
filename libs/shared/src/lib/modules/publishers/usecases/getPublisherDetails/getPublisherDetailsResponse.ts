import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetPublisherDetailsErrors } from './getPublisherDetailsErrors';
import { Publisher } from '../../domain/Publisher';

export type GetPublisherDetailsResponse = Either<
  GetPublisherDetailsErrors.PublisherNotFoundError | UnexpectedError,
  Result<Publisher>
>;
