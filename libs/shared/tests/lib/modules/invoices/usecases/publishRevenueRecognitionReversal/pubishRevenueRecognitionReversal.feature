Feature: Publish revenue recognition reversal to Netsuite

Scenario: Revenue Recognition Reversal for Invoice
    Given An Invoice "testing-invoice"
    Given The payer country is "RO" and the type is "INDIVIDUAL"
    When Reversal usecase executes for Invoice "testing-invoice"
    Then Reversal is registered for Invoice "testing-invoice"

Scenario: Revenue Recognition Reversal for discounted Invoice
    Given An Invoice with ID "discounted-invoice"
    Given The payer country is "RO" and the type is "INSTITUTION"
    Given A Discount apply for Invoice "discounted-invoice"
    When Reversal usecase executes for Invoice "discounted-invoice"
    Then Reversal is registered for Invoice "discounted-invoice"
    Then The Invoice "discounted-invoice" is discounted

Scenario: Revenue Recognition Reversal for VAT Invoice
    Given An Invoice with ID "invoice-vat"
    Given The payer country is "GB" and the type is "INDIVIDUAL"
    Given A VAT apply for Invoice "invoice-vat"
    When Reversal usecase executes for Invoice "invoice-vat"
    Then Reversal is registered for Invoice "invoice-vat"
    Then The Invoice "invoice-vat" has VAT applied