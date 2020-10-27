import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import * as Errors from './softDeleteDraftTransactionErrors';

export type SoftDeleteDraftTransactionResponse = Either<
  | Errors.ManuscriptNotFoundError
  | Errors.InvoiceItemNotFoundError
  | Errors.InvoiceNotFoundError
  | Errors.TransactionNotFoundError
  | UnexpectedError,
  Result<void>
>;
