import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './softDeleteDraftTransactionErrors';

export type SoftDeleteDraftTransactionResponse = Either<
  | Errors.ManuscriptNotFoundError
  | Errors.InvoiceItemNotFoundError
  | Errors.InvoiceNotFoundError
  | Errors.TransactionNotFoundError
  | UnexpectedError,
  void
>;
