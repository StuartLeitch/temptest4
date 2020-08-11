import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { UpdateInvoiceItemsErrors } from './updateInvoiceItemsErrors';

export type UpdateInvoiceItemsResponse = Either<
  UpdateInvoiceItemsErrors.InvoiceItemNotFound | UnexpectedError,
  Result<void>
>;
