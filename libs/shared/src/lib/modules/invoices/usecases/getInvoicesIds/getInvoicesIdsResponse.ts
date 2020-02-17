import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetInvoicesIdsErrors } from './getInvoicesIdsErrors';

export type GetInvoicesIdsResponse = Either<
  GetInvoicesIdsErrors.Error | AppError.UnexpectedError,
  Result<AsyncGenerator<string, void, unknown>>
>;
