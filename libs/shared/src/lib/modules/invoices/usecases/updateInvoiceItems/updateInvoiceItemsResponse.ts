import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './updateInvoiceItemsErrors';

export type UpdateInvoiceItemsResponse = Either<
  Errors.InvoiceItemNotFound | UnexpectedError,
  void
>;
