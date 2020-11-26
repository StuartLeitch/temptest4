import { WatchedList } from '../../../core/domain/WatchedList';

import { CouponAssigned } from './CouponAssigned';
import { Coupon } from './Coupon';

export class CouponAssignedCollection extends WatchedList<CouponAssigned> {
  get coupons(): Coupon[] {
    return this.currentItems.map((i) => i.coupon);
  }

  private constructor(initialList: CouponAssigned[]) {
    super(initialList);
  }

  public static create(list?: CouponAssigned[]): CouponAssignedCollection {
    return new CouponAssignedCollection(list ?? []);
  }

  public compareItems(a: CouponAssigned, b: CouponAssigned): boolean {
    return a.equals(b);
  }
}
