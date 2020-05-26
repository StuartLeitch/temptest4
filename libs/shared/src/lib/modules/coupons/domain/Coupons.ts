import { WatchedList } from '../../../core/domain/WatchedList';
import { Coupon } from './Coupon';

export class Coupons extends WatchedList<Coupon> {
  private constructor(initialCoupons: Coupon[]) {
    super(initialCoupons);
  }

  public static create(coupons?: Coupon[]): Coupons {
    return new Coupons(coupons ? coupons : []);
  }

  public compareItems(a: Coupon, b: Coupon): boolean {
    return a.equals(b);
  }
}
