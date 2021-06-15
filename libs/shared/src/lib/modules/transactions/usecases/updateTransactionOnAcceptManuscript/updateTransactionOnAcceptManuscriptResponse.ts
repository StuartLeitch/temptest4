import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './updateTransactionOnAcceptManuscriptErrors';

export type UpdateTransactionOnAcceptManuscriptResponse = Either<
  | Errors.CatalogItemNotFoundError
  | Errors.InvoiceItemNotFoundError
  | Errors.TransactionNotFoundError
  | Errors.ManuscriptNotFoundError
  | Errors.InvoiceNotFoundError
  | UnexpectedError,
  void
>;
