import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { CreditNote } from '../../domain/CreditNote';
import { CreateCreditNoteErrors } from './createCreditNoteErrors';

export type CreateCreditNoteResponse = Either<
  | CreateCreditNoteErrors.TransactionNotFoundError
  | CreateCreditNoteErrors.InvoiceNotFoundError
  | CreateCreditNoteErrors.InvoiceIsDraftError
  | UnexpectedError
  | GuardFailure,
  CreditNote
>;
