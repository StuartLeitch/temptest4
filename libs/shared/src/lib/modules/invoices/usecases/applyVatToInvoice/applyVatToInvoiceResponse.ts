import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { GetItemsForInvoiceErrors } from '../getItemsForInvoice';
import { UpdateInvoiceItemsErrors } from '../updateInvoiceItems';

export type ApplyVatToInvoiceResponse = Either<
  | GetItemsForInvoiceErrors.InvoiceNotFoundError
  | UpdateInvoiceItemsErrors.InvoiceItemNotFound
  | GetItemsForInvoiceErrors.InvoiceHasNoItems
  | UnexpectedError,
  void
>;
