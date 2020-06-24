import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

export type RefreshVATRatesResponse = Either<
  AppError.UnexpectedError | Result<any>,
  Result<void>
>;
