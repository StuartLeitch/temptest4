Feature: Coupons Repo test

    Background: 
        Given a coupon "coupon1" with code "CA02T0A1"
        And a coupon "coupon2" with code "8DAN6R7GB"
        And a coupon "coupon3" with code "8DAN6R7GB"
    
    Scenario: Obtain a coupon collection
        When we call getCouponCollection
        Then it should get a list of coupons

    Scenario: Obtain coupon by invoiceItemId
        When we call getCouponsByInvoiceItemId
        Then it should add the coupons to invoice item

    Scenario: Obtain coupon by couponId
        When we call getCouponById for "coupon1"
        Then it should return the coupon

    Scenario: Obtain coupon by coupon code
        When we call getCouponByCode for code "CA02T0A1"
        Then it should return the coupon

    Scenario: Increment redeem count for coupon
        When we call incrementRedeemedCount
        Then redeem count should be higher with 1

    Scenario: Update coupon
        When we call update method
        Then the coupon "coupon1" should be updated

    Scenario: Check if code its used 
        When we call isCodeUsed with "8DAN6R7GB"
        Then it should return true
