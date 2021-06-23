import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { InvoiceItem } from '../../domain/InvoiceItem';

import * as Errors from './getItemsForInvoiceErrors';

export type GetItemsForInvoiceResponseErrors =
  | Errors.IncorrectInvoiceIdError
  | Errors.InvoiceNotFoundError
  | Errors.InvoiceHasNoItems
  | UnexpectedError;

export type GetItemsForInvoiceResponse = Either<
  GetItemsForInvoiceResponseErrors,
  InvoiceItem[]
>;
