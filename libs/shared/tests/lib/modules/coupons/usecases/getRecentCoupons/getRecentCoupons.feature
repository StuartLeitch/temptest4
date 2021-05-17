Feature: getRecentCouponsUsecase test

    @ValidateGetRecentCoupons
    Scenario: For a recently added coupon, I should be able to obtain it 
        Given I have the coupon "cuponel" with "RERRO231"
        When I execute getRecenCouponsUsecase
        Then I should receive the recently added coupon
        
    @ValidateGetRecentCoupons
    Scenario: For no recently added coupon, I should not obtain anything
        When I execute getRecenCouponsUsecase
        Then I should not receive any coupon