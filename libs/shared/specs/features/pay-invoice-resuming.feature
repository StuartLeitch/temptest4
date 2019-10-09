Feature: Pay Invoice

  Scenario: Resuming pay invoice flow
    Given As a Payer reviewing Transaction Details
    When I select "individual"
    Then the invoice should be updated
    Given As a Payer reviewing Transaction Details
    Then the invoice should have "individual" payment mode
