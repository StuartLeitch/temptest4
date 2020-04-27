import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

export type GetRecentCouponsResponse = Either<
  AppError.UnexpectedError,
  Result<any>
>;
