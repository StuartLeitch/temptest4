import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { CreditNote } from '../../domain/CreditNote';
import * as Errors from './createCreditNoteErrors';

export type CreateCreditNoteResponse = Either<
  | Errors.TransactionNotFoundError
  | Errors.InvoiceNotFoundError
  | Errors.InvoiceIsDraftError
  | UnexpectedError
  | GuardFailure,
  CreditNote
>;
