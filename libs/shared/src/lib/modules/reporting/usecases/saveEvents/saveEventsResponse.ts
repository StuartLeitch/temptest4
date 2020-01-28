import { AppError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

export type SaveEventsResponse = Either<AppError.UnexpectedError, Result<void>>;
