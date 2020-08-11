import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Result';

import * as Errors from './publishInvoicePaid.errors';

export type PublishInvoicePaidResponse = Either<
  | Errors.BillingAddressRequiredError
  | Errors.PaymentMethodsRequiredError
  | Errors.InvoiceItemsRequiredError
  | Errors.ManuscriptRequiredError
  | Errors.PaymentsRequiredError
  | Errors.InvoiceRequiredError
  | Errors.PayerRequiredError
  | UnexpectedError,
  void
>;
