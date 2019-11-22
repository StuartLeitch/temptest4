import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../.././core/logic/AppError';

import { RecordPaymentErrors } from './recordPaymentErrors';

export type RecordPaymentResponse = Either<
  | RecordPaymentErrors.PayerNotFoundError
  | RecordPaymentErrors.InvoiceNotFoundError
  | AppError.UnexpectedError,
  Result<void>
>;
