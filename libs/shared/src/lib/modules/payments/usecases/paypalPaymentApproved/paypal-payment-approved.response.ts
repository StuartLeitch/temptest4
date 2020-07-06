import { AppError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './paypal-payment-approved.errors';

export type PayPalPaymentApprovedResponse = Either<
  | Errors.SavingNewStatusForPaymentDbError
  | Errors.PayPalOrderIdRequiredError
  | Errors.InvoiceIdRequiredError
  | AppError.UnexpectedError,
  void
>;
