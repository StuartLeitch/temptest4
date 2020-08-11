import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';
import { Coupon } from '../../../../modules/coupons/domain/Coupon';

import {
  InvoiceNotFoundError,
  CouponNotFoundError,
  TransactionNotFoundError,
  ManuscriptNotFoundError,
} from './applyCouponToInvoiceErrors';

export type ApplyCouponToInvoiceResponse = Either<
  | InvoiceNotFoundError
  | CouponNotFoundError
  | TransactionNotFoundError
  | ManuscriptNotFoundError
  | UnexpectedError,
  Result<Coupon>
>;
