import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as GenerateCompensatoryEventsErrors from './generateCompensatoryEventsErrors';

export type GenerateCompensatoryEventsResponse = Either<
  | GenerateCompensatoryEventsErrors.PublishInvoiceFinalizedError
  | GenerateCompensatoryEventsErrors.PublishInvoiceConfirmError
  | GenerateCompensatoryEventsErrors.PublishInvoicePayedError
  | GenerateCompensatoryEventsErrors.InvoiceIdRequiredError
  | UnexpectedError,
  Result<void>
>;
