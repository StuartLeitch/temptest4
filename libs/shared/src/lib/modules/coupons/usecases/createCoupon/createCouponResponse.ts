import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Coupon } from '../../domain/Coupon';

import { CreateCouponErrors } from './createCouponErrors';

export type CreateCouponResponse = Either<
  | CreateCouponErrors.ExpirationDateRequired
  | CreateCouponErrors.InvalidInvoiceItemType
  | CreateCouponErrors.InvalidExpirationDate
  | CreateCouponErrors.DuplicateCouponCode
  | CreateCouponErrors.InvalidCouponStatus
  | CreateCouponErrors.InvalidCouponCode
  | CreateCouponErrors.InvalidCouponType
  | AppError.UnexpectedError,
  Result<Coupon>
>;
