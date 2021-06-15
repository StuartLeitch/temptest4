import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

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
  | UnexpectedError
  | GuardFailure,
  Coupon
>;
