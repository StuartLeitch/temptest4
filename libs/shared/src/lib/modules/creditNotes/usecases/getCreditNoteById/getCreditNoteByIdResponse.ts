import { Either } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByIdErrors } from './getCreditNoteByIdErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByIdResponse = Either<
  | GetCreditNoteByIdErrors.CreditNoteNotFoundError
  | UnexpectedError
  | GuardFailure,
  CreditNote
>;
