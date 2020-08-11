import { Either, Result } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { CouponNotFoundError } from './getCouponDetailsByCodeErrors';
import { Coupon } from '../../domain/Coupon';

export type GetCouponDetailsByCodeResponse = Either<
  CouponNotFoundError | UnexpectedError,
  Result<Coupon>
>;
