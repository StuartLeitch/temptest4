import { Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as GetVATNoteErrors from './getVATNoteErrors';

export type GetVATNoteResponse = Either<
  | GetVATNoteErrors.PayerNotFoundError
  | UnexpectedError,
  string
>;
