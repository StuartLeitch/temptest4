import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import * as Errors from './restoreSoftDeleteDraftTransaction.errors';

export type RestoreSoftDeleteDraftTransactionResponse = Either<
  | Errors.InvoiceRestoreError
  | Errors.TransactionNotFoundError
  | Errors.InvoiceNotFoundError
  | Errors.InvoiceItemNotFoundError
  | Errors.ManuscriptNotFoundError
  | Errors.InvoiceItemRestoreError
  | Errors.InvoiceRestoreError
  | Errors.ManuscriptRestoreError
  | Errors.TransactionRestoreError
  | Errors.ManuscriptRequiredError
  | UnexpectedError,
  Result<void>
>;
