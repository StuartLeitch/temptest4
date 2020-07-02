Feature: Payment Method Repo

    Scenario: Test PaymentMethod.getPaymentMethodById() method
        Given a payment method with the id "foo-paymentMethod"
        When we call getPaymentMethodById for "foo-paymentMethod"
        Then getPaymentMethodById returns payment method

    Scenario: Test PaymentMethod.getPaymentMethodById() method
        Given a payment method with the id "foo-paymentMethod"
        When we call getPaymentMethodById for an un-existent payment method "foo-paymentMethod2"
        Then getPaymentMethodById returns null

    Scenario Outline: Test PaymentMethod.exists() method
        Given a payment method with the id "foo-paymentMethod"
        When we call exists for <paymentMethod> payment method id
        Then PaymentMethod.exists returns <exists>

        Examples:
            | paymentMethod      | exists |
            | foo-paymentMethod  | true   |
            | foo-paymentMethod2 | false  |

    Scenario: Test PaymentMethod.save() method
        Given we have an payment method object with the id "foo-paymentMethod"
        When we call PaymentMethod.save on the payment method object
        Then the PaymentMethod object should be saved
