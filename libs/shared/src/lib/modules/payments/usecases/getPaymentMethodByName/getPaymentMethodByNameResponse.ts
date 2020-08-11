import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetPaymentMethodByNameErrors } from './getPaymentMethodByNameErrors';
import { PaymentMethod } from '../../domain/PaymentMethod';

export type GetPaymentMethodByNameResponse = Either<
  | GetPaymentMethodByNameErrors.NoPaymentMethodFound
  | GetPaymentMethodByNameErrors.SearchNameMustNotBeEmpty
  | UnexpectedError,
  Result<PaymentMethod>
>;
