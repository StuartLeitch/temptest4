import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetItemsForInvoiceErrors } from '../getItemsForInvoice/getItemsForInvoiceErrors';
import { UpdateInvoiceItemsErrors } from '../updateInvoiceItems';

export type ApplyVatToInvoiceResponse = Either<
  | GetItemsForInvoiceErrors.InvoiceNotFoundError
  | UpdateInvoiceItemsErrors.InvoiceItemNotFound
  | GetItemsForInvoiceErrors.InvoiceHasNoItems
  | UnexpectedError,
  Result<void>
>;
