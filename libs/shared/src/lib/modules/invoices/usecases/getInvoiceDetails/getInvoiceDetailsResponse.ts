import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { GetInvoiceDetailsErrors } from './getInvoiceDetailsErrors';
import { Invoice } from './../../domain/Invoice';

export type GetInvoiceDetailsResponse = Either<
  GetInvoiceDetailsErrors.InvoiceNotFoundError | UnexpectedError,
  Result<Invoice>
>;
