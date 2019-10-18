import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../.././core/logic/AppError';

export type ValidateVATResponse = Either<
  AppError.UnexpectedError | Result<any>,
  Result<void>
>;
