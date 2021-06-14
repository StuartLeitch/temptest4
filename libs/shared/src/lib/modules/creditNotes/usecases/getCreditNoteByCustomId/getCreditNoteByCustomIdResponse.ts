import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByCustomIdErrors } from './getCreditNoteByCustomIdErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByCustomIdResponse = Either<
  GetCreditNoteByCustomIdErrors.CreditNoteNotFoundError | UnexpectedError,
  Result<CreditNote>
>;
