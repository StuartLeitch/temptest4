import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

export type GetApcsResponse = Either<UnexpectedError, any>;
