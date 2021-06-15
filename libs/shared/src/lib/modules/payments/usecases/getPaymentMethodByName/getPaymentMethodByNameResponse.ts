import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { PaymentMethod } from '../../domain/PaymentMethod';

import * as Errors from './getPaymentMethodByNameErrors';

export type GetPaymentMethodByNameResponse = Either<
  | Errors.NoPaymentMethodFound
  | Errors.SearchNameMustNotBeEmpty
  | UnexpectedError,
  PaymentMethod
>;
