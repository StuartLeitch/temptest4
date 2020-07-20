import { HandleContract } from '../../contracts/Handle';
import { DomainEvents } from '../../DomainEvents';
import { MockCouponCreatedEvent } from '../events/mockCouponCreatedEvent';
import { MockCouponUpdatedEvent } from '../events/mockCouponUpdatedEvent';
import { MockCouponAppliedEvent } from '../events/mockCouponAppliedEvent';

export class MockCouponPublish
  implements
    HandleContract<MockCouponCreatedEvent>,
    HandleContract<MockCouponUpdatedEvent>,
    HandleContract<MockCouponAppliedEvent> {
  /**
   * This is how we may setup subscriptions to domain events.
   */

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handleCouponCreatedEvent,
      MockCouponCreatedEvent.name
    );
    DomainEvents.register(this.handleUpdatedEvent, MockCouponUpdatedEvent.name);
  }

  /**
   * These are examples of how we define the handlers for domain events.
   */

  handleCouponCreatedEvent(event: MockCouponCreatedEvent): void {
    // console.log('A coupon was created!');
  }

  handleUpdatedEvent(event: MockCouponUpdatedEvent): void {
    // console.log('A coupon was updated!');
  }
}
