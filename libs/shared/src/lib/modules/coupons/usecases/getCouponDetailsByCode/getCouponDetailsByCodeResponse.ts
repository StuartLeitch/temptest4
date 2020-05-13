import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { CouponNotFoundError } from './getCouponDetailsByCodeErrors';
import { Coupon } from '../../domain/Coupon';

export type GetCouponDetailsByCodeResponse = Either<
  CouponNotFoundError | AppError.UnexpectedError,
  Result<Coupon>
>;
