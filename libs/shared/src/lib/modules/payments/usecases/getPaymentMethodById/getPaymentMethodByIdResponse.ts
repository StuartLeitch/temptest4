import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PaymentMethod } from '../../domain/PaymentMethod';

import * as Errors from './getPaymentMethodByIdErrors';

export type GetPaymentMethodByIdResponse = Either<
  Errors.NoPaymentMethodFound | UnexpectedError,
  PaymentMethod
>;
