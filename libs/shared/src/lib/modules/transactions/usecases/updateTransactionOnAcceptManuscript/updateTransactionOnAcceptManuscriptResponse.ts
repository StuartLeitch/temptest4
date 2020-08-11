import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { UpdateTransactionOnAcceptManuscriptErrors } from './updateTransactionOnAcceptManuscriptErrors';

export type UpdateTransactionOnAcceptManuscriptResponse = Either<
  | UpdateTransactionOnAcceptManuscriptErrors.CatalogItemNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.InvoiceItemNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.TransactionNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.ManuscriptNotFoundError
  | UpdateTransactionOnAcceptManuscriptErrors.InvoiceNotFoundError
  | UnexpectedError,
  Result<void>
>;
