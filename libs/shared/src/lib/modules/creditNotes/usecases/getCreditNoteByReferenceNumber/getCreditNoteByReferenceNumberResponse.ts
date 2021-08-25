import { Either } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as Errors from './getCreditNoteByReferenceNumberErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByReferenceNumberResponse = Either<
  Errors.CreditNoteNotFoundError | UnexpectedError | GuardFailure,
  CreditNote
>;
