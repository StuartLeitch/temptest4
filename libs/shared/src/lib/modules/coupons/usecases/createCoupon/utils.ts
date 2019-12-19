import { left, right, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';

import { InvoiceItemType } from '@hindawi/phenom-events/src/lib/invoiceItem';

import { CouponType, CouponStatus } from '../../../../domain/reductions/Coupon';
import { CouponCode } from '../../../../domain/reductions/CouponCode';
import { CouponId } from '../../../../domain/reductions/CouponId';
import { CreateCouponErrors } from './createCouponErrors';
import { CreateCouponDTO } from './createCouponDTO';

type SanityCheckResult = Either<
  | CreateCouponErrors.InvalidInvoiceItemType
  | CreateCouponErrors.NoAvailableCouponCodes
  | CreateCouponErrors.InvalidExpirationDate
  | CreateCouponErrors.DuplicateCouponCode
  | CreateCouponErrors.InvalidCouponStatus
  | CreateCouponErrors.InvalidRedeemCount
  | CreateCouponErrors.InvalidCouponCode
  | CreateCouponErrors.InvalidCouponType
  | AppError.UnexpectedError,
  CreateCouponDTO
>;

export function isCouponCodeValid(code: string): boolean {
  const codeRegex = /^[A-Z0-9]{6, 10}$/;
  if (code && !code.match(codeRegex)) {
    return false;
  }
  return true;
}

function isExpirationAfterNow(expiration: Date): boolean {
  const now = new Date();
  if (expiration.getUTCFullYear() < now.getUTCFullYear()) {
    return false;
  }
  if (expiration.getUTCMonth() < now.getUTCMonth()) {
    return false;
  }
  if (expiration.getUTCDate() < now.getUTCDate()) {
    return false;
  }
  return true;
}

export function isExpirationDateValid(
  expirationDate: Date,
  couponType: CouponType
): boolean {
  if (
    couponType === CouponType.MULTIPLE_USE &&
    !isExpirationAfterNow(expirationDate)
  ) {
    return false;
  }
  return true;
}

export function sanityChecksRequestParameters(
  request: CreateCouponDTO,
  usedCoupons: string[]
): SanityCheckResult {
  const {
    invoiceItemType,
    expirationDate,
    redeemCount,
    couponType,
    status,
    code
  } = request;
  if (!(invoiceItemType in InvoiceItemType)) {
    return left(new CreateCouponErrors.InvalidInvoiceItemType(invoiceItemType));
  }
  if (!(couponType in CouponType)) {
    return left(new CreateCouponErrors.InvalidCouponType(couponType));
  }
  if (!(status in CouponStatus)) {
    return left(new CreateCouponErrors.InvalidCouponStatus(status));
  }
  if (redeemCount <= 0) {
    return left(new CreateCouponErrors.InvalidRedeemCount(redeemCount));
  }
  if (!isCouponCodeValid(code)) {
    return left(new CreateCouponErrors.InvalidCouponCode(code));
  }
  if (
    !isExpirationDateValid(new Date(expirationDate), CouponType[couponType])
  ) {
    return left(new CreateCouponErrors.InvalidExpirationDate(expirationDate));
  }
  if (code && usedCoupons.includes(code)) {
    return left(new CreateCouponErrors.DuplicateCouponCode(code));
  }

  return right(request);
}

export function generateUniqueCouponCode(
  couponId: CouponId,
  existingCodes: string[]
): Either<CreateCouponErrors.NoAvailableCouponCodes, CouponCode> {
  if (existingCodes.length === CouponCode.MAX_NUMBER_OF_CODES) {
    return left(new CreateCouponErrors.NoAvailableCouponCodes());
  }

  const found = false;
  while (!found) {
    const code = CouponCode.generateCouponCode();
    if (!existingCodes.includes(code.value)) {
      return right(code);
    }
  }
}
