import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

import { CreditNote } from '../../domain/CreditNote';
import { CreateCreditNoteErrors } from './createCreditNoteErrors';

export type CreateCreditNoteResponse = Either<
  | CreateCreditNoteErrors.TransactionNotFoundError
  | CreateCreditNoteErrors.InvoiceNotFoundError
  | CreateCreditNoteErrors.InvoiceIsDraftError
  | UnexpectedError,
  Result<CreditNote>
>;
