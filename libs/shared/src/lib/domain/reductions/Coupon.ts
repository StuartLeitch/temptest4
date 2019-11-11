// * Core Domain
import {Result} from '../../core/logic/Result';
import {UniqueEntityID} from '../../core/domain/UniqueEntityID';

import {ReductionProps} from './Reduction';
import {Discount} from './Discount';
import {CouponCreated} from './../../modules/coupons/domain/events/couponCreated';

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
    // coupon.addDomainEvent(new AfterCouponCreated(coupon));

    return Result.ok<Coupon>(coupon);
  }

  // public publish(coupon: Coupon): Result<void> {
  //   this.addDomainEvent(new CouponCreated(coupon));
  //   return Result.ok<void>();
  // }
}
