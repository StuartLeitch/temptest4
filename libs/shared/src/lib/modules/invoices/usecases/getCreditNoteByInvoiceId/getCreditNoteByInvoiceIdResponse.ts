import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './getCreditNoteByInvoiceIdErrors';
import { Invoice } from '../../domain/Invoice';

export type GetCreditNoteByInvoiceIdResponse = Either<
  Errors.CreditNoteNotFoundError | UnexpectedError,
  Invoice
>;
