import { Result, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { Coupon } from '../../domain/Coupon';

import * as CreateCouponErrors from './createCouponErrors';

export type CreateCouponResponse = Either<
  | CreateCouponErrors.ExpirationDateRequiredError
  | CreateCouponErrors.InvalidInvoiceItemTypeError
  | CreateCouponErrors.InvalidExpirationDateError
  | CreateCouponErrors.DuplicateCouponCodeError
  | CreateCouponErrors.InvalidCouponStatusError
  | CreateCouponErrors.InvalidCouponCodeError
  | CreateCouponErrors.InvalidCouponTypeError
  | AppError.UnexpectedError,
  Result<Coupon>
>;
