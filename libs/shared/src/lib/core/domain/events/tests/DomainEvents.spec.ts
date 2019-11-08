import * as sinon from 'sinon';

import {DomainEvents} from '../DomainEvents';
import {UniqueEntityID} from '../../UniqueEntityID';

import {MockCouponAggregateRoot} from './mocks/domain/mockCouponAggregateRoot';
import {MockCouponAggregateRootId} from './mocks/domain/mockCouponAggregateRootId';

import {MockCouponCreatedEvent} from './mocks/events/mockCouponCreatedEvent';
import {MockCouponUpdatedEvent} from './mocks/events/mockCouponUpdatedEvent';
// import {MockCouponAppliedEvent} from './mocks/events/mockCouponAppliedEvent';

import {MockCouponPublish} from './mocks/services/mockCouponPublish';

let publish: MockCouponPublish;
let coupon: MockCouponAggregateRoot;
let spy: sinon.spy;

describe('Domain Events', () => {
  beforeEach(() => {
    publish = null;
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    spy = null;
    coupon = null;
  });

  describe('Given a CouponCreatedEvent, CouponUpdatedEvent and a CouponPublish handler class', () => {
    it('Should be able to setup event subscriptions', () => {
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      expect(Object.keys(DomainEvents['handlersMap']).length).toBe(2);

      expect(
        DomainEvents['handlersMap'][MockCouponCreatedEvent.name].length
      ).toBe(1);
      expect(
        DomainEvents['handlersMap'][MockCouponUpdatedEvent.name].length
      ).toBe(1);
    });

    it('There should be exactly one handler subscribed to the CouponCreatedEvent', () => {
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      expect(
        DomainEvents['handlersMap'][MockCouponCreatedEvent.name].length
      ).toBe(1);
    });

    it('There should be exactly one handler subscribed to the CreatedUpdatedEvent', () => {
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      expect(
        DomainEvents['handlersMap'][MockCouponCreatedEvent.name].length
      ).toBe(1);
    });

    it('Should add the event to the DomainEvents list when the event is created', () => {
      coupon = MockCouponAggregateRoot.createCoupon(
        {},
        MockCouponAggregateRootId
      );
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      sinon.spy(DomainEvents, 'markAggregateForDispatch');

      // setTimeout(() => {
      //   expect(domainEventsAggregateSpy.calledOnce).toBeTruthy();
      //   expect(domainEventsAggregateSpy.callCount).toBe(0)
      //   expect(DomainEvents['markedAggregates'][0]['length']).toBe(1);
      // }, 1000);
    });

    it('Should call the handlers when the event is dispatched after marking the aggregate root', () => {
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      // var couponCreatedEventSpy = sinon.spy(social, 'handleCouponCreatedEvent');
      // var couponDeletedEventSpy = sinon.spy(social, 'handleCouponUpdatedEvent');

      // Create the event, mark the aggregate
      coupon = MockCouponAggregateRoot.createCoupon(
        {},
        MockCouponAggregateRootId
      );

      // Dispatch the events now
      DomainEvents.dispatchEventsForAggregate(MockCouponAggregateRootId);

      // setTimeout(() => {
      //   expect(jobCreatedEventSpy.calledOnce).toBeFalsy();
      //   expect(jobDeletedEventSpy.calledOnce).toBeTruthy();
      // }, 1000);
    });

    it('Should remove the marked aggregate from the marked aggregates list after it gets dispatched', () => {
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      // Create the event, mark the aggregate
      coupon = MockCouponAggregateRoot.createCoupon(
        {},
        MockCouponAggregateRootId
      );

      // Dispatch the events now
      DomainEvents.dispatchEventsForAggregate(MockCouponAggregateRootId);

      // setTimeout(() => {
      //   expect(DomainEvents['markedAggregates']['length']).toBe(0);
      // }, 1000);
    });

    it('Should only add the domain event to the ', () => {
      publish = new MockCouponPublish();
      publish.setupSubscriptions();

      // Create the event, mark the aggregate
      MockCouponAggregateRoot.createCoupon({}, new UniqueEntityID('99'));
      expect(DomainEvents['markedAggregates']['length']).toBe(1);

      // Create a new coupon, it should also get marked
      coupon = MockCouponAggregateRoot.createCoupon(
        {},
        new UniqueEntityID('12')
      );
      expect(DomainEvents['markedAggregates']['length']).toBe(2);

      // Dispatch another action from the second coupon created
      coupon.applyCoupon();

      // The number of aggregates should be the same
      expect(DomainEvents['markedAggregates']['length']).toBe(2);

      // However, the second aggregate should have two events now
      expect(DomainEvents['markedAggregates'][1].domainEvents.length).toBe(2);

      // And the first aggregate should have one event
      expect(DomainEvents['markedAggregates'][0].domainEvents.length).toBe(1);

      // Dispatch the event for the first job
      DomainEvents.dispatchEventsForAggregate(new UniqueEntityID('99'));
      expect(DomainEvents['markedAggregates']['length']).toBe(1);

      // The job with two events should still be there
      expect(DomainEvents['markedAggregates'][0].domainEvents.length).toBe(2);

      // Dispatch the event for the second job
      DomainEvents.dispatchEventsForAggregate(new UniqueEntityID('12'));

      // There should be no more domain events in the list
      expect(DomainEvents['markedAggregates']['length']).toBe(0);
    });
  });
});
