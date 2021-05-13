Feature: createCuponUsecase test

    Scenario: For coupon details, create a coupon
        Given I execute the usecase for a coupon with ID "coup1" and code "RTERRR"
        Then the coupon should be created

    Scenario: For inactive coupon details, do not create coupon
        Given I execute the usecase for an inactive coupon with ID "inactive-coupon" and code "TESTINACTIVE"
        Then the coupon should not be created