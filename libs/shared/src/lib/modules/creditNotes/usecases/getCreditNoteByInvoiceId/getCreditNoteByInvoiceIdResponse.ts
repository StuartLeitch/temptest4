import { Either } from '../../../../core/logic/Either';
import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByInvoiceIdResponse = Either<
  | GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError
  | UnexpectedError
  | GuardFailure,
  CreditNote
>;
