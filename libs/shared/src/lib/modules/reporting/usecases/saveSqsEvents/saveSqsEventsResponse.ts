import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

export type SaveSqsEventsResponse = Either<UnexpectedError, Result<void>>;
