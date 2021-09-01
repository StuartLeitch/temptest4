import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './generateCreditNoteCompensatoryEventsErrors';

export type GenerateCreditNoteCompensatoryEventsResponse = Either<
  Errors.CreditNoteIdRequiredError | UnexpectedError,
  void
>;
