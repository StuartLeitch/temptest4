Feature: Domain Events

    Scenario: CouponPublish available Events
        Given and a CouponPublish handler class
        When we set up a CouponPublish subscription
        Then CouponPublish should be able to handle 2 event types
        And There should be exactly one handler subscribed to the CouponCreatedEvent
        And There should be exactly one handler subscribed to the CreatedUpdatedEvent

    Scenario: Domain Events handle 1
        Given and a CouponPublish handler class
        When we set up a CouponPublish subscription
        And we generate a coupon with the id "foo-coupon"
        Then  DomainEvents should contain 1 event

        When we dispatch the DomainEvents for id "foo-coupon"
        Then the marked aggregate list should be empty

    Scenario: Domain Events handle 2
        Given and a CouponPublish handler class
        When we set up a CouponPublish subscription
        And we generate a coupon with the id "foo-coupon"
        Then DomainEvents should contain 1 event

        And we generate a coupon with the id "foo-coupon2"
        Then DomainEvents should contain 2 event

        When we call apply on the coupon "foo-coupon2"
        Then DomainEvents should contain 2 event
        And The aggregate with index 1 should have 2 events
        And The aggregate with index 0 should have 1 events

        When we dispatch the DomainEvents for id "foo-coupon"
        Then  DomainEvents should contain 1 event
        And The aggregate with index 0 should have 2 events

        When we dispatch the DomainEvents for id "foo-coupon2"
        Then DomainEvents should contain 0 event