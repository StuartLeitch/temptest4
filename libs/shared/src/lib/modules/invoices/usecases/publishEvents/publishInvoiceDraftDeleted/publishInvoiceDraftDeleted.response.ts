import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Result';

import * as Errors from './publishInvoiceDraftDeleted.errors';

export type PublishInvoiceDraftDeletedResponse = Either<
  | Errors.InvoiceItemsRequiredError
  | Errors.InvoiceRequiredError
  | Errors.ManuscriptRequiredError
  | Errors.SQSServiceFailure
  | UnexpectedError,
  void
>;
