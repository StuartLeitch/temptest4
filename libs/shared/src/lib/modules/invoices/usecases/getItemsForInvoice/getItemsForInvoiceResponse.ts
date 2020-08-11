import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetItemsForInvoiceErrors } from './getItemsForInvoiceErrors';
import { InvoiceItem } from '../../domain/InvoiceItem';

export type GetItemsForInvoiceResponseErrors =
  | GetItemsForInvoiceErrors.InvoiceNotFoundError
  | GetItemsForInvoiceErrors.InvoiceHasNoItems
  | UnexpectedError;

export type GetItemsForInvoiceResponse = Either<
  GetItemsForInvoiceResponseErrors,
  Result<InvoiceItem[]>
>;
