import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

export type SetTransactionStatusToActiveResponse = Either<UnexpectedError, void>;
