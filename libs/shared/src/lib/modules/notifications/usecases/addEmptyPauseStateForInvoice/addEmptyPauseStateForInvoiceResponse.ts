import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { NotificationPause } from '../../domain/NotificationPause';

import * as AddEmptyPauseStateForInvoiceErrors from './addEmptyPauseStateForInvoiceErrors';

export type AddEmptyPauseStateForInvoiceResponse = Either<
  | AddEmptyPauseStateForInvoiceErrors.InvoiceIdRequiredError
  | AddEmptyPauseStateForInvoiceErrors.InvoiceNotFoundError
  | AddEmptyPauseStateForInvoiceErrors.AddPauseDbError
  | UnexpectedError,
  Result<NotificationPause>
>;
