import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Result';

import { Transaction } from './../../domain/Transaction';

import * as Errors from './getTransactionByInvoiceIdErrors';

export type GetTransactionByInvoiceIdResponse = Either<
  | Errors.InvoiceIdRequiredError
  | Errors.TransactionNotFoundError
  | UnexpectedError,
  Transaction
>;
