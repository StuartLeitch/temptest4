// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {ReductionProps} from './Reduction';
import {Discount} from './Discount';

// * Coupon Domain Events
import {CouponCreated} from './../../modules/coupons/domain/events/couponCreated';
import {CouponUpdated} from './../../modules/coupons/domain/events/couponUpdated';
import {CouponApplied} from './../../modules/coupons/domain/events/couponApplied';

export class Coupon extends Discount {
  private constructor(props: ReductionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get reduction(): number {
    return this.props.reduction;
  }

  get created(): Date {
    return this.props.created;
  }

  public static create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Coupon> {
    const coupon = new Coupon(
      {
        ...props,
        type: 'COUPON'
      },
      id
    );

    coupon.addDomainEvent(new CouponCreated(coupon));

    return Result.ok<Coupon>(coupon);
  }
}
