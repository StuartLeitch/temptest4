import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

export type GetRecentInvoicesResponse = Either<UnexpectedError, any>;
