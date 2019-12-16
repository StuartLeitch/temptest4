import { Coupon } from '../../../domain/reductions/Coupon';
import { CouponId } from '../../../domain/reductions/CouponId';
import { Repo } from '../../../infrastructure/Repo';

export interface CouponRepoContract extends Repo<Coupon> {
  getCouponCollection(): Promise<Coupon[]>;
  getCouponById(couponId: CouponId): Promise<Coupon>;
}
