import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Result';

import { Transaction } from './../../domain/Transaction';

import * as Errors from './createTransactionErrors';

export type CreateTransactionResponse = Either<
  | Errors.AuthorsEmailsRequiredError
  | Errors.ManuscriptIdRequiredError
  | Errors.CatalogItemNotFoundError
  | Errors.InvoiceItemCreatedError
  | Errors.ManuscriptNotFoundError
  | Errors.SaveRemindersStateError
  | Errors.TransactionCreatedError
  | Errors.WaiversCalculationError
  | Errors.JournalIdRequiredError
  | Errors.SaveInvoiceItemError
  | Errors.SaveTransactionError
  | Errors.InvoiceCreatedError
  | Errors.SaveInvoiceError
  | UnexpectedError,
  Transaction
>;
