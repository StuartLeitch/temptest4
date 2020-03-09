import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { SendInvoicePaymentReminderErrors } from './sendInvoicePaymentReminderErrors';

export type SendInvoicePaymentReminderResponse = Either<
  | SendInvoicePaymentReminderErrors.ManuscriptCustomIdRequired
  | AppError.UnexpectedError,
  Result<void>
>;
