import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as Errors from './getInvoicesIdsErrors';

export type GetInvoicesIdsResponse = Either<
  Errors.FilteringInvoicesDbError | UnexpectedError,
  Result<AsyncGenerator<string, void, unknown>>
>;
