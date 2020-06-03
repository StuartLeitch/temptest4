import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import * as Errors from './getInvoicesIdsErrors';

export type GetInvoicesIdsResponse = Either<
  Errors.FilteringInvoicesDbError | AppError.UnexpectedError,
  Result<AsyncGenerator<string, void, unknown>>
>;
