import { AppError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

export type SaveSqsEventsResponse = Either<
  AppError.UnexpectedError,
  Result<void>
>;
