import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Result';

import { Payment } from './../../domain/Payment';
import * as Errors from './CreatePaymentErrors';

export type CreatePaymentResponse = Either<
  | Errors.ForeignPaymentIdRequiredError
  | Errors.PaymentMethodIdRequiredError
  | Errors.StatusInvalidValueError
  | Errors.InvoiceIdRequiredError
  | Errors.PaymentCreationError
  | Errors.PayerIdRequiredError
  | Errors.PaymentSavingDbError
  | Errors.AmountRequiredError
  | Errors.StatusRequiredError
  | UnexpectedError,
  Payment
>;
