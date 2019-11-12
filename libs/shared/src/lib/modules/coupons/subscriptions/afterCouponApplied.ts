import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';

import {CouponApplied} from '../../coupons/domain/events/couponApplied';
import {PublishCouponApplied} from '../usecases/publishCouponApplied';

export class AfterCouponApplied implements HandleContract<CouponApplied> {
  constructor(private publishCouponApplied: PublishCouponApplied) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onPublishCouponApplied.bind(this),
      CouponApplied.name
    );
  }

  private async onPublishCouponApplied(event: CouponApplied): Promise<void> {
    const {coupon} = event;

    try {
      await this.publishCouponApplied.execute(coupon);
      console.log(
        `[AfterCouponApplied]: Successfully executed PublishCouponApplied use case AfterCouponApplied`
      );
    } catch (err) {
      console.log(
        `[AfterCouponApplied]: Failed to execute PublishCouponApplied use case AfterCouponApplied.`
      );
    }
  }
}
