Feature: Apply Coupon to Invoice Usecase test

    Background:
        Given we have an Invoice with id "test-invoice"
        And a coupon with id "coupon1" with code "TESTINGBS"

    @ValidateApplyCoupon
    Scenario: For a given invoice apply a coupon
        When I apply coupon for invoice "test-invoice" with code "TESTINGBS"
        Then coupon should be applied for invoice "test-invoice"

    @ValidateApplyCoupon
    Scenario: For a given invoice apply an inactive coupon
        When I apply inactive coupon for invoice "test-invoice" with code "TESTBS"
        Then I receive an error that coupon is inactive