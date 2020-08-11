import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { GetPaymentMethodByIdErrors } from './getPaymentMethodByIdErrors';
import { PaymentMethod } from '../../domain/PaymentMethod';

export type GetPaymentMethodByIdResponse = Either<
  GetPaymentMethodByIdErrors.NoPaymentMethodFound | UnexpectedError,
  Result<PaymentMethod>
>;
