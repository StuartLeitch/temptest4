import {Transaction} from './../../domain/Transaction';
import {Either, Result} from '../../../../core/logic/Result';
import {CreateTransactionErrors} from './createTransactionErrors';
import {AppError} from '../../../../core/logic/AppError';

export type CreateTransactionResponse = Either<
  | CreateTransactionErrors.TransactionCreatedError
  | CreateTransactionErrors.InvoiceCreatedError
  | CreateTransactionErrors.InvoiceItemCreatedError
  | AppError.UnexpectedError
  | Result<any>,
  Result<Transaction>
>;
