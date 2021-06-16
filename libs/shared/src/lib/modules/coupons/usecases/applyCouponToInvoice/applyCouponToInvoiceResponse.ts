import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Coupon } from '../../../../modules/coupons/domain/Coupon';

import * as Errors from './applyCouponToInvoiceErrors';

export type ApplyCouponToInvoiceResponse = Either<
  | Errors.CouponAlreadyUsedForInvoiceError
  | Errors.InvoiceConfirmationFailed
  | Errors.InvoiceItemsNotFoundError
  | Errors.InvoiceStatusInvalidError
  | Errors.TransactionNotFoundError
  | Errors.ManuscriptNotFoundError
  | Errors.CouponAlreadyUsedError
  | Errors.InvoiceNotFoundError
  | Errors.CouponInactiveError
  | Errors.CouponNotFoundError
  | Errors.CouponExpiredError
  | Errors.CouponInvalidError
  | UnexpectedError
  | GuardFailure,
  Coupon
>;
