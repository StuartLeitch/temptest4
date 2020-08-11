import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { InvoicePaymentInfo } from '../../../invoices/domain/InvoicePaymentInfo';

import * as GetPaymentInfoErrors from './getPaymentInfoErrors';

export type GetPaymentInfoResponse = Either<
  | GetPaymentInfoErrors.InvoiceIdRequiredError
  | GetPaymentInfoErrors.InvoiceNotFoundError
  | GetPaymentInfoErrors.NoPaymentFoundError
  | GetPaymentInfoErrors.PaymentInfoDbError
  | UnexpectedError,
  Result<InvoicePaymentInfo>
>;
