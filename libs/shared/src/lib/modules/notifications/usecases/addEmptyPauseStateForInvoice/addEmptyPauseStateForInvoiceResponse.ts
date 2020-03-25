import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { NotificationPause } from '../../domain/NotificationPause';

import { AddEmptyPauseStateForInvoiceErrors } from './addEmptyPauseStateForInvoiceErrors';

export type AddEmptyPauseStateForInvoiceResponse = Either<
  | AddEmptyPauseStateForInvoiceErrors.InvoiceIdRequiredError
  | AddEmptyPauseStateForInvoiceErrors.InvoiceNotFoundError
  | AddEmptyPauseStateForInvoiceErrors.AddPauseDbError
  | AppError.UnexpectedError,
  Result<NotificationPause>
>;
