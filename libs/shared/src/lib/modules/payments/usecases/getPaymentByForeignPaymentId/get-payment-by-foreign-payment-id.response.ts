import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payment } from '../../domain/Payment';

import * as Errors from './get-payment-by-foreign-payment-id.errors';

export type GetPaymentByForeignPaymentIdResponse = Either<
  | Errors.ForeignPaymentIdRequiredError
  | Errors.DbCommunicationError
  | UnexpectedError,
  Payment
>;
