import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

export class CouponNotFoundError extends Result<UseCaseError> {
  constructor(couponCode: string) {
    super(false, {
      message: `Couldn't find a Coupon with code {${couponCode}}.`,
    } as UseCaseError);
  }
}
