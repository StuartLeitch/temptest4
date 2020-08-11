import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { SetTransactionToActiveByCustomIdErrors } from './setTransactionToActiveByCustomIdErrors';
import { Transaction } from './../../domain/Transaction';

export type SetTransactionToActiveByCustomIdResponse = Either<
  | SetTransactionToActiveByCustomIdErrors.ManuscriptNotFoundError
  | UnexpectedError,
  Result<Transaction>
>;
