import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import * as Errors from './publishInvoiceDraftCreated.errors';

export type PublishInvoiceDraftCreatedResponse = Either<
  | Errors.InvoiceItemsRequiredError
  | Errors.InvoiceRequiredError
  | Errors.ManuscriptRequiredError
  | Errors.SQSServiceFailure
  | UnexpectedError,
  void
>;
