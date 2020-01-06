import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Coupon } from '../../domain/Coupon';

import { UpdateCouponErrors } from './updateCouponErrors';

export type UpdateCouponResponse = Either<
  | UpdateCouponErrors.InvalidExpirationDate
  | UpdateCouponErrors.InvalidCouponStatus
  | UpdateCouponErrors.InvalidCouponType
  | UpdateCouponErrors.IdRequired
  | UpdateCouponErrors.InvalidId
  | AppError.UnexpectedError,
  Result<Coupon>
>;
