Feature: Apply Coupon to Invoice Usecase test

    Background:
        Given we have an Invoice with id "test-invoice"
        And a coupon with id "coupon1" with code "TESTINGBS" and reduction "50"

    @ValidateApplyCoupon
    Scenario: For a given invoice apply a coupon
        When I apply coupon for invoice "test-invoice" with code "TESTINGBS"
        Then coupon should be applied for invoice "test-invoice"

    @ValidateApplyCoupon
    Scenario: For a given invoice apply an inactive coupon
        When I apply inactive coupon for invoice "test-invoice" with code "TESTBS"
        Then I receive an error that coupon is inactive

    @ValidateApplyCoupon
    Scenario: When an invoice has an 100% reduction applied it is auto-confirmed
        Given a coupon with id "coupon2" with code "TEST100" and reduction "100"
        When I apply coupon for invoice "test-invoice" with code "TEST100"
        Then The invoice with id "test-invoice" is auto-confirmed

    @ValidateApplyCoupon
    Scenario: When an invoice has a waiver of 50% and a coupon of 50% is applied the invoice in auto-confirmed
        Given A waiver of "50" is applied to invoice "test-invoice"
        When I apply coupon for invoice "test-invoice" with code "TESTINGBS"
        Then The invoice with id "test-invoice" is auto-confirmed

    @ValidateApplyCoupon
    Scenario: When appling a second time the same coupon an error occures
        Given a coupon with id "coupon3" with code "TEST10" and reduction "10"
        When I apply coupon for invoice "test-invoice" with code "TEST10"
        And I apply coupon for invoice "test-invoice" with code "TEST10"
        Then I receive an error that coupon with code "TEST10" is already applied
