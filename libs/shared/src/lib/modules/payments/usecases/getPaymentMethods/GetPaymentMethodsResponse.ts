import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PaymentMethod } from '../../domain/PaymentMethod';

import * as Errors from './GetPaymentMethodsErrors';

export type GetPaymentMethodsResponse = Either<
  UnexpectedError | Errors.GetPaymentMethodsDbRequestError,
  PaymentMethod[]
>;
