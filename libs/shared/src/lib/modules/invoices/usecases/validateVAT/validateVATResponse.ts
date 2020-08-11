import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

export type ValidateVATResponse = Either<
  UnexpectedError | Result<any>,
  Result<void>
>;
