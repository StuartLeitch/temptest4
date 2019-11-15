import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetItemsForInvoiceErrors } from './getItemsForInvoiceErrors';
import { InvoiceItem } from '../../domain/InvoiceItem';

export type GetItemsForInvoiceResponseErrors =
  | GetItemsForInvoiceErrors.InvoiceNotFoundError
  | GetItemsForInvoiceErrors.InvoiceHasNoItems
  | AppError.UnexpectedError;

export type GetItemsForInvoiceResponse = Either<
  GetItemsForInvoiceResponseErrors,
  Result<InvoiceItem[]>
>;
