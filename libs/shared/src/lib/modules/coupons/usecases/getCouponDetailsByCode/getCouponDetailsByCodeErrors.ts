import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class CouponNotFoundError extends UseCaseError {
  constructor(couponCode: string) {
    super(`Couldn't find a Coupon with code {${couponCode}}.`);
  }
}
