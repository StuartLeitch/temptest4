import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetItemsForInvoiceErrors } from '../getItemsForInvoice/getItemsForInvoiceErrors';
import { UpdateInvoiceItemsErrors } from '../updateInvoiceItems';

export type ApplyVatToInvoiceResponse = Either<
  | GetItemsForInvoiceErrors.InvoiceNotFoundError
  | UpdateInvoiceItemsErrors.InvoiceItemNotFound
  | GetItemsForInvoiceErrors.InvoiceHasNoItems
  | AppError.UnexpectedError,
  Result<void>
>;
