Feature: Set Transaction Value

  Scenario: Select transaction
    Given As System retrieving Transaction Details
    When I read the associated APC for the Transaction
    And APC value is set to 100
    Then the Transaction value should be 100
