import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Result';

import * as Errors from './publishInvoiceDraftDeleted.error';

export type PublishInvoiceDraftDeletedResponse = Either<
  | Errors.InvoiceItemsRequiredError
  | Errors.InvoiceRequiredError
  | Errors.ManuscriptRequiredError
  | UnexpectedError,
  void
>;
