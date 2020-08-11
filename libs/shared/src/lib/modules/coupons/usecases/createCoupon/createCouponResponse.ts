import { Result, Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';

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
  | UnexpectedError,
  Result<Coupon>
>;
