import {DomainEventContract} from '../../../../core/domain/events/contracts/DomainEvent';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {Coupon} from '../../../../domain/reductions/Coupon';

export class CouponApplied implements DomainEventContract {
  constructor(
    public coupon: Coupon,
    public dateTimeOccurred: Date = new Date()
  ) {}

  getAggregateId(): UniqueEntityID {
    return this.coupon.id;
  }
}
