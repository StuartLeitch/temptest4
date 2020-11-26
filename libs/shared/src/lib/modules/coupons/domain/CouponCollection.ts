import { WatchedList } from '../../../core/domain/WatchedList';
import { Coupon } from './Coupon';

export class CouponCollection extends WatchedList<Coupon> {
  private constructor(initialCoupons: Coupon[]) {
    super(initialCoupons);
  }

  public static create(coupons?: Coupon[]): CouponCollection {
    return new CouponCollection(coupons ? coupons : []);
  }

  public compareItems(a: Coupon, b: Coupon): boolean {
    return a.equals(b);
  }
}
