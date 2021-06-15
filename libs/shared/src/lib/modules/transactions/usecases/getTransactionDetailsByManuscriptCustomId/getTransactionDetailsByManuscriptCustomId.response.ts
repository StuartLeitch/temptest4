import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Transaction } from '../../domain/Transaction';

import * as Errors from './getTransactionDetailsByManuscriptCustomId.errors';

export type GetTransactionDetailsByManuscriptCustomIdResponse = Either<
  | Errors.TransactionNotFoundError
  | Errors.CustomIdRequiredError
  | UnexpectedError,
  Transaction
>;
