import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByIdErrors } from './getCreditNoteByIdErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByIdResponse = Either<
  GetCreditNoteByIdErrors.CreditNoteNotFoundError | UnexpectedError,
  Result<CreditNote>
>;
