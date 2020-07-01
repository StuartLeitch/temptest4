import { UniqueEntityID } from './../../../../../../src/lib/core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../../../../../shared/src/lib/core/domain/AggregateRoot';

import { MockCouponCreatedEvent } from '../events/mockCouponCreatedEvent';
import { MockCouponUpdatedEvent } from '../events/mockCouponUpdatedEvent';
import { MockCouponAppliedEvent } from '../events/mockCouponAppliedEvent';

export class MockCouponAggregateRoot extends AggregateRoot<{}> {
  private constructor(props: {}, id?: UniqueEntityID) {
    super(props, id);
  }

  public static createCoupon(
    props: {},
    id?: UniqueEntityID
  ): MockCouponAggregateRoot {
    const coupon = new this(props, id);
    coupon.addDomainEvent(new MockCouponCreatedEvent(coupon.id));
    return coupon;
  }

  public updateCoupon(): void {
    this.addDomainEvent(new MockCouponUpdatedEvent(this.id));
  }

  public applyCoupon(): void {
    this.addDomainEvent(new MockCouponAppliedEvent(this.id));
  }
}
