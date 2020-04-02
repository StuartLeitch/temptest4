import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetCreditNoteByInvoiceIdErrors } from './getCreditNoteByInvoiceIdErrors';
import { Invoice } from '../../domain/Invoice';

export type GetCreditNoteByInvoiceIdResponse = Either<
  | GetCreditNoteByInvoiceIdErrors.CreditNoteNotFoundError
  | AppError.UnexpectedError,
  Result<Invoice>
>;
