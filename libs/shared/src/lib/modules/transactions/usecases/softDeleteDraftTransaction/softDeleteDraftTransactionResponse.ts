import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { SoftDeleteDraftTransactionErrors } from './softDeleteDraftTransactionErrors';

export type SoftDeleteDraftTransactionResponse = Either<
  // | SoftDeleteDraftTransactionErrors.TransactionNotFoundError
  AppError.UnexpectedError,
  Result<void>
>;
