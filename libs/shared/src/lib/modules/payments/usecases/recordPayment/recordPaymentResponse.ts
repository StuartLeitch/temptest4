import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { RecordPaymentErrors } from './recordPaymentErrors';
import { Invoice } from '../../../invoices/domain/Invoice';

export type RecordPaymentResponse = Either<
  RecordPaymentErrors.InvalidPaymentAmount | AppError.UnexpectedError,
  Result<Invoice>
>;
