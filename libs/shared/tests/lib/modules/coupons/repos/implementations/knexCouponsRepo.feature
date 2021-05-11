Feature: Coupons Repo test

    Scenario: Obtain a coupon collection
        Given a coupon "coupon1" with code "CA02T0A1"
        And a coupon "coupon2" with code "8DAN6R7GB"
        When we call getCouponCollection
        Then it should get a list of coupons

    Scenario: Obtain coupon by invoiceItemId
        Given a coupon "coupon3" with code "ASD123444"
        When we call getCouponsByInvoiceItemId
        Then it should add the coupon to invoice item

    Scenario: Obtain coupon by couponId
        Given a coupon "coupon1" with code "CA02T0A1"
        When we call getCouponById for "coupon1"
        Then it should return the coupon

    Scenario: Obtain coupon by coupon code
        Given a coupon "coupon1" with code "CA02T0A1"
        When we call getCouponByCode for code "CA02T0A1"
        Then it should return the coupon