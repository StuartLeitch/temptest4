Feature: updateCouponUsecase test

    Background:
        Given the coupon "coupon" with "RRERTF"
    
    Scenario: Having a coupon, update some fields
        When I execute updateCouponUsecase for id "coupon"
        Then I should see the modification on coupon

    Scenario: Having a coupon, no modified fields are updated
        When I execute updateCouponUsecase without changes for "coupon"
        Then I should see the original details on coupon