import {HandleContract} from '../../../core/domain/events/contracts/Handle';
import {DomainEvents} from '../../../core/domain/events/DomainEvents';

// import {Coupon} from '../../coupons/domain/Coupon';
import {CouponCreated} from '../../coupons/domain/events/couponCreated';
import {PublishCouponCreated} from '../usecases/publishCouponCreated';

export class AfterCouponCreated implements HandleContract<CouponCreated> {
  // private publishCouponCreated: PublishCouponCreated;

  constructor(private publishCouponCreated: PublishCouponCreated) {
    this.setupSubscriptions();
    // this.publishCouponCreated = publishCouponCreated;
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(
      this.onPublishCouponCreated.bind(this),
      CouponCreated.name
    );
  }

  private async onPublishCouponCreated(event: CouponCreated): Promise<void> {
    const {coupon} = event;

    try {
      await this.publishCouponCreated.execute(coupon);
      console.log(
        `[AfterCouponCreated]: Successfully executed PublishCouponCreated use case AfterCouponCreated`
      );
    } catch (err) {
      console.log(
        `[AfterCouponCreated]: Failed to execute PublishCouponCreated use case AfterCouponCreated.`
      );
    }
  }
}
