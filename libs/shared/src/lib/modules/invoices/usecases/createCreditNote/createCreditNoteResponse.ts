import { AppError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

import { Invoice } from '../../domain/Invoice';
import { CreateCreditNoteErrors } from './createCreditNoteErrors';

export type CreateCreditNoteResponse = Either<
  CreateCreditNoteErrors.InvoiceNotFoundError | AppError.UnexpectedError,
  Result<Invoice>
>;
