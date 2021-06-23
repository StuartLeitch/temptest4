import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';
import { GuardFailure } from '../../../../../core/logic/GuardFailure';

import * as Errors from './publishCreditNoteCreatedErrors';

export type PublishCreditNoteCreatedResponse = Either<
  | Errors.BillingAddressRequiredError
  | Errors.PaymentMethodsRequiredError
  | Errors.InvoiceItemsRequiredError
  | Errors.CreditNoteRequiredError
  | Errors.ManuscriptRequiredError
  | Errors.PaymentsRequiredError
  | Errors.PayerRequiredError
  | GuardFailure
  | UnexpectedError,
  void
>;
