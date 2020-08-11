import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

export type SaveEventsResponse = Either<UnexpectedError, Result<void>>;
