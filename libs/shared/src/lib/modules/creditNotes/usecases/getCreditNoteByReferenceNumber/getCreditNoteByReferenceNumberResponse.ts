import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByReferenceNumberErrors } from './getCreditNoteByReferenceNumberErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByReferenceNumberResponse = Either<
  | GetCreditNoteByReferenceNumberErrors.CreditNoteNotFoundError
  | UnexpectedError,
  Result<CreditNote>
>;
