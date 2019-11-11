import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';

import {CouponUpdated} from '../../coupons/domain/events/couponUpdated';
import {PublishCouponUpdated} from '../usecases/publishCouponUpdated';

export class AfterCouponUpdated implements HandleContract<CouponUpdated> {
  constructor(private publishCouponUpdated: PublishCouponUpdated) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onPublishCouponUpdated.bind(this),
      CouponUpdated.name
    );
  }

  private async onPublishCouponUpdated(event: CouponUpdated): Promise<void> {
    const {coupon} = event;

    try {
      await this.publishCouponUpdated.execute(coupon);
      console.log(
        `[AfterCouponCreated]: Successfully executed publishCouponUpdated use case AfterCouponUpdated`
      );
    } catch (err) {
      console.log(
        `[AfterCouponCreated]: Failed to execute publishCouponUpdated use case AfterCouponUpdated.`
      );
    }
  }
}
