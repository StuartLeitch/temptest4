import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../../core/logic/AppError';

import {Payment} from './../../domain/Payment';
import {CreatePaymentErrors} from './CreatePaymentErrors';

export type CreatePaymentResponse = Either<
  | CreatePaymentErrors.PaymentCreatedError
  | AppError.UnexpectedError
  | Result<any>,
  Result<Payment>
>;
