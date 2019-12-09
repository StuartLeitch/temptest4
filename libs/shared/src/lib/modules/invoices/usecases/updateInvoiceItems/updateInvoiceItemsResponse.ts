import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { UpdateInvoiceItemsErrors } from './updateInvoiceItemsErrors';

export type UpdateInvoiceItemsResponse = Either<
  UpdateInvoiceItemsErrors.InvoiceItemNotFound | AppError.UnexpectedError,
  Result<void>
>;
