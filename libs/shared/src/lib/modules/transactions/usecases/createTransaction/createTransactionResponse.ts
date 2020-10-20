import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

import { Transaction } from './../../domain/Transaction';

import * as Errors from './createTransactionErrors';

export type CreateTransactionResponse = Either<
  | Errors.InvoiceItemCreatedError
  | Errors.TransactionCreatedError
  | Errors.InvoiceCreatedError
  | UnexpectedError,
  Result<Transaction>
>;
