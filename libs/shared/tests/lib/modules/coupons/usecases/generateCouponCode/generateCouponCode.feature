Feature: generateCouponCodeUsecase test

    @ValidateGenerateCouponCode
    Scenario: 
        Given I call the execution of the usecase
        Then I expect a coupon code to be generated