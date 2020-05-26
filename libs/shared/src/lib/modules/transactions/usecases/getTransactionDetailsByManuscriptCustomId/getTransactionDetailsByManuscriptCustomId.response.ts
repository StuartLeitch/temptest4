import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Transaction } from '../../domain/Transaction';

import * as Errors from './getTransactionDetailsByManuscriptCustomId.errors';

export type GetTransactionDetailsByManuscriptCustomIdResponse = Either<
  | Errors.TransactionNotFoundError
  | Errors.CustomIdRequiredError
  | AppError.UnexpectedError,
  Result<Transaction>
>;
