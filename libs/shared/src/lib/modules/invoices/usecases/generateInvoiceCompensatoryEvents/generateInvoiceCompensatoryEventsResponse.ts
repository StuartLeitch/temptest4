import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './generateInvoiceCompensatoryEventsErrors';

export type GenerateInvoiceCompensatoryEventsResponse = Either<
  | Errors.PublishInvoiceFinalizedError
  | Errors.PublishInvoiceConfirmError
  | Errors.PublishInvoicePayedError
  | Errors.InvoiceIdRequiredError
  | UnexpectedError,
  void
>;
