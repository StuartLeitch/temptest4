import { Invoice } from '../../domain/Invoice';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

import { ChangeInvoiceStatusErrors } from './changeInvoiceStatusErrors';

export type ChangeInvoiceStatusResponse = Either<
  | ChangeInvoiceStatusErrors.ChangeStatusError
  | ChangeInvoiceStatusErrors.InvoiceNotFoundError
  | UnexpectedError,
  Result<Invoice>
>;
