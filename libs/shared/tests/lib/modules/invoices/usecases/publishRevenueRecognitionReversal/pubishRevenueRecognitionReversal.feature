Feature: Publish revenue recognition reversal to Netsuite

Scenario: Revenue Recognition Reversal is registered with success in Netsuite
    Given An Invoice with the ID "testing-invoice"
    Given The payer country is "RO" and the type is "INDIVIDUAL"
    Given There is a discounted Invoice with the ID "testing-invoice"
    When Revenue recognition reversal usecase executes for the invoice with the ID "testing-invoice"
    Then Revenue recognition reversal is registered to Netsuite for Invoice with ID "testing-invoice"
