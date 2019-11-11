// require('dotenv').config();

// import {makeDb} from './services/knex';

// import {makeConfig} from './config';
// import {makeContext} from './context';
// import {makeGraphqlServer} from './graphql';
// import {makeExpressServer} from './api';

import {AfterCouponCreated} from '../../../libs/shared/src/lib/modules/coupons/subscriptions/afterCouponCreated';
import {PublishCouponCreated} from '../../../libs/shared/src/lib/modules/coupons/usecases/publishCouponCreated/publishCouponCreated';

// import '../../../libs/shared/src/lib/modules/coupons/subscriptions';
import {DomainEvents} from '../../../libs/shared/src/lib/core/domain/events/DomainEvents';
import {CouponMap} from '../../../libs/shared/src/lib/modules/coupons/mappers/CouponMap';
import {queueService} from './queue_service';

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
  queue.start();

  await couponEventsTest(queue);

  // const config = await makeConfig();
  // const db = await makeDb(config);
  // const context = makeContext(config, db);

  // const graphqlServer = makeGraphqlServer(context);
  // const expressServer = makeExpressServer(context);

  // graphqlServer.applyMiddleware({
  //   app: expressServer,
  //   path: '/graphql'
  // });

  // expressServer.listen(process.env.PORT || 4000);
}

main().catch(err => {
  console.log('Unexpected error');
  console.error(err);
  process.exit(1);
});
