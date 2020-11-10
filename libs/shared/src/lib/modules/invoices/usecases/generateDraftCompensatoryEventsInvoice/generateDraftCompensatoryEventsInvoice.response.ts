import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './generateDraftCompensatoryEventsInvoice.errors';

export type GenerateDraftCompensatoryEventsInvoiceResponse = Either<
  Errors.InvoiceIdRequiredError | UnexpectedError,
  void
>;
