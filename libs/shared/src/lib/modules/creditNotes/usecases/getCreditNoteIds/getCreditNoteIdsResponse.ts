import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './getCreditNoteIdsErrors';

export type GetCreditNoteIdsResponse = Either<
  Errors.FilteringCreditNotesDbError | UnexpectedError,
  AsyncGenerator<string, void, unknown>
>;
