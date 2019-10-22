Feature: VAT Rates

  Scenario: Refresh VAT Rates
    Given The Admin is logged in
    When The Admin refresh the vat rates
    Then The new VAT rates should be available
