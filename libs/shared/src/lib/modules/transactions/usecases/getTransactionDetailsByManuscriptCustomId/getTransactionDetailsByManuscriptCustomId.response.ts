import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Transaction } from '../../domain/Transaction';

import * as Errors from './getTransactionDetailsByManuscriptCustomId.errors';

export type GetTransactionDetailsByManuscriptCustomIdResponse = Either<
  | Errors.TransactionNotFoundError
  | Errors.CustomIdRequiredError
  | UnexpectedError,
  Result<Transaction>
>;
