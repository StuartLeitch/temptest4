import { AppError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';
import { Coupon } from '../../../../modules/coupons/domain/Coupon';

import { InvoiceNotFoundError, CouponNotFoundError } from './applyCouponToInvoiceErrors';

export type ApplyCouponToInvoiceResponse = Either<
  | InvoiceNotFoundError
  | CouponNotFoundError
  | AppError.UnexpectedError,
  Result<Coupon>
>;
