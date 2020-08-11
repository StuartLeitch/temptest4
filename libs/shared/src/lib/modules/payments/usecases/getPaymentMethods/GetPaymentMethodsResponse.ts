import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import * as Errors from './GetPaymentMethodsErrors';

import { PaymentMethod } from '../../domain/PaymentMethod';

export type GetPaymentMethodsResponse = Either<
  UnexpectedError | Errors.GetPaymentMethodsDbRequestError,
  Result<PaymentMethod[]>
>;
