import {Repo} from '../../../infrastructure/Repo';
import {Coupon} from '../../../domain/reductions/Coupon';
import {ReductionId} from './../../../domain/reductions/ReductionId';

export interface CouponRepoContract extends Repo<Coupon> {
  getCouponCollection(): Promise<Coupon[]>;
  getCouponById(couponId: ReductionId): Promise<Coupon>;
}
