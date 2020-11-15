import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './generate-draft-compensatory-events.errors';

export type GenerateDraftCompensatoryEventsResponse = Either<
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceHasNoManuscript
  | UnexpectedError,
  void
>;
