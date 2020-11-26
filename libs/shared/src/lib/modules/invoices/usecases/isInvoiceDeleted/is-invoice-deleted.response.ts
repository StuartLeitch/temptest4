import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './is-invoice-deleted.errors';

export type IsInvoiceDeletedResponse = Either<
  Errors.InvoiceIdRequiredError | Errors.InvoiceCheckDbError | UnexpectedError,
  boolean
>;
