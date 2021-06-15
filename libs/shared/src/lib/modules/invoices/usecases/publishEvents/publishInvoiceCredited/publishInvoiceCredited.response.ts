import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import * as Errors from './publishInvoiceCredited.errors';

export type PublishInvoiceCreditedResponse = Either<
  | Errors.BillingAddressRequiredError
  | Errors.PaymentMethodsRequiredError
  | Errors.InvoiceItemsRequiredError
  | Errors.CreditNoteRequiredError
  | Errors.ManuscriptRequiredError
  | Errors.PaymentsRequiredError
  | Errors.PayerRequiredError
  | UnexpectedError,
  void
>;
