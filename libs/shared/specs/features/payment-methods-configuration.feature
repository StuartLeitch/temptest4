Feature: Configure payment methods

  Scenario: Configure a payment method as Customer
    Given I am Customer
    When I try to configure payment methods
    Then I should not be allowed

  Scenario: Configure a payment method as Admin
    Given I am Admin
    When I try to configure payment methods
    Then I should be allowed

  Scenario: Set a payment method as active
    Given I am Admin
    When I try to set a payment method as active
    Then The PaymentMethod should appear as available

  Scenario: Set a payment method as inactive
    Given I am Admin
    When I try to set a payment method as inactive
    Then The PaymentMethod should not appear as available
