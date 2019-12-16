// * Core Domain
import { Result } from '../../core/logic/Result';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

import { ReductionProps, Reduction, ReductionType } from './Reduction';

// * Coupon Domain Events
import { CouponCreated } from './../../modules/coupons/domain/events/couponCreated';
import { CouponId } from './CouponId';

export enum CouponType {
  SINGLE_USE = 'SINGLE_USE',
  MULTIPLE_USE = 'MULTIPLE_USE'
}

export interface CouponProps extends ReductionProps {
  couponType: CouponType;
}

export class Coupon extends Reduction<CouponProps> {
  private constructor(props: CouponProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public get couponId(): CouponId {
    return CouponId.create(this._id).getValue()
  }

  public get reductionType(): ReductionType {
    return ReductionType.COUPON;
  }

  public get reduction(): number {
    return this.props.reduction;
  }

  public get couponType(): CouponType {
    return this.props.couponType;
  }

  public static create(
    props: CouponProps,
    id?: UniqueEntityID
  ): Result<Coupon> {
    const coupon = new Coupon(
      props,
      id
    );

    coupon.addDomainEvent(new CouponCreated(coupon));

    return Result.ok<Coupon>(coupon);
  }
}
