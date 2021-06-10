import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { CreditNote } from '../../domain/CreditNote';

export type GetCreditNoteByInvoiceIdResponse = Either<
  GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError | UnexpectedError,
  Result<CreditNote>
>;
