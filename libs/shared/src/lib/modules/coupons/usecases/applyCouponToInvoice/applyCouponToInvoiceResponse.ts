import { AppError } from 'libs/shared/src/lib/core/logic/AppError';
import { Either, Result } from 'libs/shared/src/lib/core/logic/Result';
import { ApplyCouponToInvoiceErrors } from './ApplyCouponToInvoiceErrors';
import { Coupon } from 'libs/shared/src/lib/modules/coupons/domain/Coupon';

export type ApplyCouponToInvoiceResponse = Either<
  | ApplyCouponToInvoiceErrors.InvoiceNotFoundError
  | ApplyCouponToInvoiceErrors.CouponNotFoundError
  | AppError.UnexpectedError,
  Result<Coupon>
>;
