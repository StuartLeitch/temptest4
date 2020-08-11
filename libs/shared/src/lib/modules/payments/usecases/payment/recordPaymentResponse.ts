import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../.././core/logic/AppError';

import { RecordPaymentErrors } from './recordPaymentErrors';

export type RecordPaymentResponse = Either<
  | RecordPaymentErrors.PayerNotFoundError
  | RecordPaymentErrors.InvoiceNotFoundError
  | UnexpectedError,
  Result<void>
>;
