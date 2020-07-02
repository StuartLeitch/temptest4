Feature: Payment Repo

    Scenario: Test Payment.getPaymentById()
        Given a payment with the id "foo-payment"
        When we call getPaymentById for "foo-payment"
        Then getPaymentById returns payment

    Scenario: Test Payment.getPaymentById()
        Given a payment with the id "foo-payment"
        When we call getPaymentById for an un-existent payment "foo-payment2"
        Then getPaymentById returns null

    Scenario Outline: Test Payment.exists()
        Given a payment with the id "foo-payment"
        When we call exists for <payment> payment id
        Then Payment.exists returns <exists>
        Examples:
            | payment      | exists |
            | foo-payment  | true   |
            | foo-payment2 | false  |

    Scenario: Test Payment.save()
        Given we have an payment object with the id "foo-payment"
        When we call Payment.save on the payment object
        Then the Payment object should be saved