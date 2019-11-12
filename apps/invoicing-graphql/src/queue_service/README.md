# Queue Service

## Integration

```typescript

import {AfterCouponCreated} from '../../../../libs/shared/src/lib/modules/coupons/subscriptions/afterCouponCreated';
import {PublishCouponCreated} from '../../../../libs/shared/src/lib/modules/coupons/usecases/publishCouponCreated/publishCouponCreated';
import {DomainEvents} from '../../../../libs/shared/src/lib/core/domain/events/DomainEvents';
import {CouponMap} from '../../../../libs/shared/src/lib/modules/coupons/mappers/CouponMap';

import {queueService} from './';

async function couponEventsTest(publishService) {
  const publishCouponCreated = new PublishCouponCreated(publishService);

  // * register subscription
  new AfterCouponCreated(publishCouponCreated);

  const coupon = CouponMap.toDomain({
    id: 'coupon-1',
    name: 'KooKoo',
    valid: true,
    reduction: 0.75
  });

  // * This is the line that actually dispatches the `after` events
  DomainEvents.dispatchEventsForAggregate(coupon.id);
}

async function main(): Promise<void> {
  const queue = await queueService;
  await queue.start();

  await couponEventsTest(queue);
}

main().catch(err => {
  console.log('Unexpected error');
  console.error(err);
  process.exit(1);
});

```
