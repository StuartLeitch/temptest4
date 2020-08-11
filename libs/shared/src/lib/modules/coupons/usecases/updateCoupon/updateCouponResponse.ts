import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { Coupon } from '../../domain/Coupon';

import { UpdateCouponErrors } from './updateCouponErrors';

export type UpdateCouponResponse = Either<
  | UpdateCouponErrors.ExpirationDateRequired
  | UpdateCouponErrors.InvalidExpirationDate
  | UpdateCouponErrors.InvalidCouponStatus
  | UpdateCouponErrors.InvalidCouponType
  | UpdateCouponErrors.IdRequired
  | UpdateCouponErrors.InvalidId
  | UnexpectedError,
  Result<Coupon>
>;
