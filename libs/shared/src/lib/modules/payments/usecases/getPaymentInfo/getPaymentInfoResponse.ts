import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { InvoicePaymentInfo } from '../../../invoices/domain/InvoicePaymentInfo';

import * as Errors from './getPaymentInfoErrors';

export type GetPaymentInfoResponse = Either<
  | Errors.InvoiceIdRequiredError
  | Errors.InvoiceNotFoundError
  | Errors.NoPaymentFoundError
  | Errors.PaymentInfoDbError
  | UnexpectedError,
  InvoicePaymentInfo
>;
