import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Coupon } from '../../domain/Coupon';

import * as Errors from './createCouponErrors';

export type CreateCouponResponse = Either<
  | Errors.ExpirationDateRequiredError
  | Errors.InvalidInvoiceItemTypeError
  | Errors.InvalidExpirationDateError
  | Errors.DuplicateCouponCodeError
  | Errors.InvalidCouponStatusError
  | Errors.InvalidCouponCodeError
  | Errors.InvalidCouponTypeError
  | Errors.CouponNotSavedError
  | UnexpectedError,
  Coupon
>;
