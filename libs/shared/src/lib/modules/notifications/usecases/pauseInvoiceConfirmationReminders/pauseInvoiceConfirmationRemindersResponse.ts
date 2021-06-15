import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './pauseInvoiceConfirmationRemindersErrors';

export type PauseInvoiceConfirmationRemindersResponse = Either<
  Errors.InvoiceIdRequiredError | Errors.InvoiceNotFoundError | UnexpectedError,
  void
>;
