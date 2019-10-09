Feature: Pay for the Product

  Scenario: Select individual payment
    Given As a Payer updating Transaction Details
    When I select "individual"
    Then the invoice should be updated
