import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { SetTransactionToActiveByCustomIdErrors } from './setTransactionToActiveByCustomIdErrors';
import { Transaction } from './../../domain/Transaction';

export type SetTransactionToActiveByCustomIdResponse = Either<
  | SetTransactionToActiveByCustomIdErrors.ManuscriptNotFoundError
  | AppError.UnexpectedError,
  Result<Transaction>
>;
