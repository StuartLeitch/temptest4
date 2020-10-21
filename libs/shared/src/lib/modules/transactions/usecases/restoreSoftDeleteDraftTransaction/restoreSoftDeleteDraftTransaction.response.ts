import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

export type RestoreSoftDeleteDraftTransactionResponse = Either<
  // | SoftDeleteDraftTransactionErrors.TransactionNotFoundError
  UnexpectedError,
  Result<void>
>;
