import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { Invoice } from '../../domain/Invoice';

export type GetCreditNoteByInvoiceIdResponse = Either<
  GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError | UnexpectedError,
  Result<Invoice>
>;
