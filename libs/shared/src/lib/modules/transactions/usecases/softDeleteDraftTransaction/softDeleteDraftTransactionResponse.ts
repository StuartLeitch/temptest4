import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { SoftDeleteDraftTransactionErrors } from './softDeleteDraftTransactionErrors';

export type SoftDeleteDraftTransactionResponse = Either<
  // | SoftDeleteDraftTransactionErrors.TransactionNotFoundError
  UnexpectedError,
  Result<void>
>;
