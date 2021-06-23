import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './getInvoicesIdsErrors';

export type GetInvoicesIdsResponse = Either<
  Errors.FilteringInvoicesDbError | UnexpectedError,
  AsyncGenerator<string, void, unknown>
>;
