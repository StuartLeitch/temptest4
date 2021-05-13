Feature: getCouponDetailsByCodeUsecase test

    Background: 
        Given I have a coupon "coup1" with code "SMBGPLM"

    Scenario: For a given code, get the coupon details
        When I call the usecase with code "SMBGPLM"
        Then I should receive the coupon

    Scenario: For an unknown code, receive nothing
        When I call the usecase with code "UNKNOWN"
        Then I should not receive the coupon