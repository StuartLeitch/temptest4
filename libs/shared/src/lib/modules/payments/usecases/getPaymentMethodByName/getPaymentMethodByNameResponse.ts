import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetPaymentMethodByNameErrors } from './getPaymentMethodByNameErrors';
import { PaymentMethod } from '../../domain/PaymentMethod';

export type GetPaymentMethodByNameResponse = Either<
  | GetPaymentMethodByNameErrors.NoPaymentMethodFound
  | GetPaymentMethodByNameErrors.SearchNameMustNotBeEmpty
  | AppError.UnexpectedError,
  Result<PaymentMethod>
>;
