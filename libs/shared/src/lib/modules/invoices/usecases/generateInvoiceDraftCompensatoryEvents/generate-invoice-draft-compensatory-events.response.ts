import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './generate-invoice-draft-compensatory-events.errors';

export type GenerateInvoiceDraftCompensatoryEventsResponse = Either<
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceHasNoManuscript
  | UnexpectedError,
  void
>;
