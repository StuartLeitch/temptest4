import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Payer } from '../../domain/Payer';

export type CreatePayerResponse = Either<UnexpectedError, Result<Payer>>;
