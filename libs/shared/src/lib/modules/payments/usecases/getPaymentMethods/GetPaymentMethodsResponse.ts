import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import * as Errors from './GetPaymentMethodsErrors';

import { PaymentMethod } from '../../domain/PaymentMethod';

export type GetPaymentMethodsResponse = Either<
  AppError.UnexpectedError | Errors.GetPaymentMethodsDbRequestError,
  Result<PaymentMethod[]>
>;
