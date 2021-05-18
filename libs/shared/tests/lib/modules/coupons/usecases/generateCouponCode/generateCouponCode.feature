Feature: generateCouponCodeUsecase test

    @ValidateGenerateCouponCode
    Scenario: 
        Given I call the execution of the usecase generateCouponCodeUsecase
        Then I expect a coupon code to be generated