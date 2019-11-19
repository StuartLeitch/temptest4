import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Invoice } from '../../../invoices/domain/Invoice';

import { RecordPaymentErrors } from '../recordPayment/recordPaymentErrors';
import { RecordPayPalPaymentErrors } from './recordPayPalPaymentErrors';

export type RecordPayPalPaymentResponse = Either<
  | RecordPayPalPaymentErrors.InvalidPayment
  | RecordPaymentErrors.InvalidPaymentAmount
  | AppError.UnexpectedError,
  Result<Invoice>
>;
