import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { GetPaymentMethodByIdErrors } from './getPaymentMethodByIdErrors';
import { PaymentMethod } from '../../domain/PaymentMethod';

export type GetPaymentMethodByIdResponse = Either<
  GetPaymentMethodByIdErrors.NoPaymentMethodFound | AppError.UnexpectedError,
  Result<PaymentMethod>
>;
