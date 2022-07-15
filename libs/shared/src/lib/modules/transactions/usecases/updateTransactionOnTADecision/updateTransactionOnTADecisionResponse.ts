import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './updateTransactionOnTADecisionErrors';

export type UpdateTransactionOnTADecisionResponse = Either<
  | Errors.InvoiceNotFoundError
  | Errors.TransactionNotUpdatedError
  | UnexpectedError,
  void
>;
