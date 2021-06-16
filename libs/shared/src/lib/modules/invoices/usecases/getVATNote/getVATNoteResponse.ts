import { Either } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as GetVATNoteErrors from './getVATNoteErrors';

export type GetVATNoteResponse = Either<
  | GetVATNoteErrors.PayerNotFoundError
  | UnexpectedError,
  string
>;
