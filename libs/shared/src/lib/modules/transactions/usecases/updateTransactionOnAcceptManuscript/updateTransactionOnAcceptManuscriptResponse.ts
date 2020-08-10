import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { UpdateTransactionOnAcceptManuscriptErrors } from './updateTransactionOnAcceptManuscriptErrors';

export type UpdateTransactionOnAcceptManuscriptResponse = Either<
  | UpdateTransactionOnAcceptManuscriptErrors.CatalogItemNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.InvoiceItemNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.TransactionNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.ManuscriptNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
