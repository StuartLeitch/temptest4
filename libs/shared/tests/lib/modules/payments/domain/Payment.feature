Feature: Payment Domain Entity

    @ValidatePayment
    Scenario: Create Payment
        Given There is a Payment Domain Entity
        When The Payment.create method is called
        Then A new Payment is successfully created
