Feature: Publish revenue recognition reversal to Netsuite

Scenario: Revenue Recognition Reversal is registered
    Given An Invoice with the ID "testing-invoice"
    Given The payer country is "RO" and the type is "INDIVIDUAL"
    When Revenue recognition reversal usecase executes for invoice "testing-invoice"
    Then Revenue recognition reversal is registered to Netsuite for Invoice "testing-invoice"

Scenario: Revenue Recognition Reversal for discounted Invoice
    Given An Invoice with the ID "discounted-invoice"
    Given The payer country is "RO" and the type is "INSTITUTION"
    Given A Discount apply for invoice with ID "discounted-invoice"
    When Revenue recognition reversal usecase executes for invoice "discounted-invoice"
    Then Revenue recognition reversal is registered to Netsuite for Invoice "discounted-invoice"