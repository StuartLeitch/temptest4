import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';
import { Coupon } from '../../../../modules/coupons/domain/Coupon';

import {
  CouponAlreadyUsedForInvoiceError,
  InvoiceConfirmationFailed,
  InvoiceStatusInvalidError,
  TransactionNotFoundError,
  ManuscriptNotFoundError,
  CouponAlreadyUsedError,
  InvoiceNotFoundError,
  CouponInactiveError,
  CouponNotFoundError,
  CouponExpiredError,
  CouponInvalidError,
} from './applyCouponToInvoiceErrors';

export type ApplyCouponToInvoiceResponse = Either<
  | CouponAlreadyUsedForInvoiceError
  | InvoiceConfirmationFailed
  | InvoiceStatusInvalidError
  | TransactionNotFoundError
  | ManuscriptNotFoundError
  | CouponAlreadyUsedError
  | InvoiceNotFoundError
  | CouponInactiveError
  | CouponNotFoundError
  | CouponExpiredError
  | CouponInvalidError
  | UnexpectedError,
  Result<Coupon>
>;
