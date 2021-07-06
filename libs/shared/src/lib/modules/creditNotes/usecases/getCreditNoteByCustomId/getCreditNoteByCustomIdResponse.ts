import { Either } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByCustomIdErrors } from './getCreditNoteByCustomIdErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByCustomIdResponse = Either<
  | GetCreditNoteByCustomIdErrors.CreditNoteNotFoundError
  | UnexpectedError
  | GuardFailure,
  CreditNote
>;
