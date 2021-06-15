import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './restoreSoftDeleteDraftTransaction.errors';

export type RestoreSoftDeleteDraftTransactionResponse = Either<
  | Errors.TransactionNotFoundError
  | Errors.InvoiceItemNotFoundError
  | Errors.InvoiceItemRestoreError
  | Errors.ManuscriptNotFoundError
  | Errors.ManuscriptRequiredError
  | Errors.TransactionRestoreError
  | Errors.ManuscriptRestoreError
  | Errors.InvoiceNotFoundError
  | Errors.InvoiceRestoreError
  | UnexpectedError,
  void
>;
