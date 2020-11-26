import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';
import * as sinon from 'sinon';

import { UniqueEntityID } from './../../../../src/lib/core/domain/UniqueEntityID';
import { DomainEvents } from './../../../../src/lib/core/domain/events/DomainEvents';

import { MockCouponCreatedEvent } from './../../../../src/lib/core/domain/events/mocks/events/mockCouponCreatedEvent';
import { MockCouponAggregateRoot } from './../../../../src/lib/core/domain/events/mocks/domain/mockCouponAggregateRoot';
import { MockCouponAggregateRootId } from './../../../../src/lib/core/domain/events/mocks/domain/mockCouponAggregateRootId';
import { MockCouponPublish } from './../../../../src/lib/core/domain/events/mocks/services/mockCouponPublish';

let publish: MockCouponPublish;
let coupon: MockCouponAggregateRoot;
let spy: sinon.spy;

Before(() => {
  publish = null;
  DomainEvents.clearHandlers();
  DomainEvents.clearMarkedAggregates();
  spy = null;
  coupon = null;
});

Given('and a CouponPublish handler class', async function () {
  publish = new MockCouponPublish();
});

When('we set up a CouponPublish subscription', async () => {
  DomainEvents.clearHandlers();
  DomainEvents.clearMarkedAggregates();
  publish.setupSubscriptions();
});

Then(
  /^CouponPublish should be able to handle (\d+) event types$/,
  async (count: number) => {
    expect(Object.keys(DomainEvents['handlersMap']).length).to.equal(count);
  }
);
Then(
  'There should be exactly one handler subscribed to the CouponCreatedEvent',
  async () => {
    expect(
      DomainEvents['handlersMap'][MockCouponCreatedEvent.name].length
    ).to.equal(1);
  }
);
Then(
  'There should be exactly one handler subscribed to the CreatedUpdatedEvent',
  async () => {
    expect(
      DomainEvents['handlersMap'][MockCouponCreatedEvent.name].length
    ).to.equal(1);
  }
);

When('we generate a CouponCreatedEvent', async () => {
  coupon = MockCouponAggregateRoot.createCoupon({}, MockCouponAggregateRootId);
  sinon.spy(DomainEvents, 'markAggregateForDispatch');
});

Then(/^DomainEvents should contain (\d+) event$/, async (count: number) => {
  expect(DomainEvents['markedAggregates'].length).to.equal(count);
});

When(
  /^we dispatch the DomainEvents for id "([\w-]+)"$/,
  async (aggregateRootId: string) => {
    const aggregateRootIdObj = new UniqueEntityID(aggregateRootId);
    DomainEvents.dispatchEventsForAggregate(aggregateRootIdObj);
  }
);

Then('the marked aggregate list should be empty', async () => {
  expect(DomainEvents['markedAggregates']['length']).to.equal(0);
});

When(
  /^we generate a coupon with the id "([\w-]+)"$/,
  async (couponId: string) => {
    const couponIdObj = new UniqueEntityID(couponId);
    coupon = MockCouponAggregateRoot.createCoupon({}, couponIdObj);
  }
);

When(/^we call apply on the coupon "([\w-]+)"$/, async (couponId: string) => {
  coupon.applyCoupon();
});

Then(
  /^The aggregate with index (\d+) should have (\d+) events$/,
  async (aggregateIndex: number, eventCount: number) => {
    expect(
      DomainEvents['markedAggregates'][aggregateIndex].domainEvents.length
    ).to.equal(eventCount);
  }
);
