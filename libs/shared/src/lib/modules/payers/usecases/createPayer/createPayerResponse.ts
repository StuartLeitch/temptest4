import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';
import { Payer } from '../../domain/Payer';

export type CreatePayerResponse = Either<
  AppError.UnexpectedError,
  Result<Payer>
>;
