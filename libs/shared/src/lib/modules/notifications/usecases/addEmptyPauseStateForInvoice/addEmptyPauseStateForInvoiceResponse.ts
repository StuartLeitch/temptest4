import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { NotificationPause } from '../../domain/NotificationPause';

import * as Errors from './addEmptyPauseStateForInvoiceErrors';

export type AddEmptyPauseStateForInvoiceResponse = Either<
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | Errors.AddPauseDbError
  | UnexpectedError,
  NotificationPause
>;
