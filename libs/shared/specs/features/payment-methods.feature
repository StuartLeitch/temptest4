Feature: Payment Methods

  Scenario: Pay with CreditCard
    Given As Payer paying for an APC
    When I choose to pay with CreditCard
    Then A new CreditCardPayment should be created

  Scenario: Pay with PayPal
    Given As Payer paying for an APC
    When I choose to pay with PayPal
    Then A new PayPalPayment should be created
