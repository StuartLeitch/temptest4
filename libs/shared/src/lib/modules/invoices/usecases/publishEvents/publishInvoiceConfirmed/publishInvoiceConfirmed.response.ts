import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Result';

import * as Errors from './publishInvoiceConfirmed.errors';

export type PublishInvoiceConfirmedResponse = Either<
  | Errors.BillingAddressRequiredError
  | Errors.InvoiceItemsRequiredError
  | Errors.ManuscriptRequiredError
  | Errors.InvoiceRequiredError
  | Errors.PayerRequiredError
  | UnexpectedError,
  void
>;
