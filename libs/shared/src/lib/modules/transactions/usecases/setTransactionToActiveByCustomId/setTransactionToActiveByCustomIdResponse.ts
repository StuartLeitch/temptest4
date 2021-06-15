import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Transaction } from './../../domain/Transaction';

import * as Errors from './setTransactionToActiveByCustomIdErrors';

export type SetTransactionToActiveByCustomIdResponse = Either<
  Errors.ManuscriptNotFoundError | UnexpectedError,
  Transaction
>;
