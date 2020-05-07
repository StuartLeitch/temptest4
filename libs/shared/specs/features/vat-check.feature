Feature: VAT Check
  Scenario: Valid VAT Check
    Given The Payer is in GB
    And The Payer VAT number is 181094119
    When The VAT number is checked
    Then The VAT should be valid

  Scenario: Invalid VAT Check
    Given The Payer is in MD
    And The Payer VAT number is 181094119
    When The VAT number is checked
    Then The VAT should be invalid
