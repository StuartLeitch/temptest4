import { CouponType } from '../domain/Coupon';

function isExpirationAfterNow(expiration: Date): boolean {
  const now = new Date();
  if (expiration.getUTCFullYear() < now.getUTCFullYear()) {
    return false;
  }
  if (
    expiration.getUTCFullYear() === now.getUTCFullYear() &&
    expiration.getUTCMonth() < now.getUTCMonth()
  ) {
    return false;
  }
  if (
    expiration.getUTCFullYear() === now.getUTCFullYear() &&
    expiration.getUTCMonth() === now.getUTCMonth() &&
    expiration.getUTCDate() < now.getUTCDate()
  ) {
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
    (!expirationDate || !isExpirationAfterNow(expirationDate))
  ) {
    return false;
  }
  return true;
}
