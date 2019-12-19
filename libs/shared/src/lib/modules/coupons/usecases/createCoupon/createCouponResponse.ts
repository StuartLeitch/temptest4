import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Coupon } from '../../../../domain/reductions/Coupon';

import { CreateCouponErrors } from './createCouponErrors';

export type CreateCouponResponse = Either<
  | CreateCouponErrors.InvalidInvoiceItemType
  | CreateCouponErrors.NoAvailableCouponCodes
  | CreateCouponErrors.InvalidExpirationDate
  | CreateCouponErrors.DuplicateCouponCode
  | CreateCouponErrors.InvalidCouponStatus
  | CreateCouponErrors.InvalidRedeemCount
  | CreateCouponErrors.InvalidCouponCode
  | CreateCouponErrors.InvalidCouponType
  | AppError.UnexpectedError,
  Result<Coupon>
>;
