Feature: Publish invoice to erp system

    @ValidatePublishInvoiceToErp
    Scenario: Invoice is saved successfully to erp
        Given There is an existing Invoice with the ID "erp-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The Invoice with the ID "erp-invoice" is published
        Then The Invoice with the ID "erp-invoice" is registered to erp

    @ValidatePublishInvoiceToErp
    Scenario Outline: Tax code is assigned correctly
        Given There is an existing Invoice with the ID "tax-invoice"
        And The payer is from "<payerCountry>" and their type is "<payerType>"
        When The Invoice with the ID "tax-invoice" is published
        Then The tax code selected for the Invoice with the ID "tax-invoice" is <taxRate>

        Examples:
            | payerCountry | payerType   | taxRate |
            | GB           | INDIVIDUAL  | GB_SR   |
            | GB           | INSTITUTION | GB_SR   |
            | UK           | INDIVIDUAL  | GB_SR   |
            | UK           | INSTITUTION | GB_SR   |
            | RO           | INDIVIDUAL  | GB_ZR   |
            | RO           | INSTITUTION | GB_ZR   |
            | CH           | INDIVIDUAL  | GB_ZR   |
            | CH           | INSTITUTION | GB_ZR   |

    @ValidatePublishInvoiceToErp
    Scenario: Fully discounted invoices are not sent to sage
        Given There is an fully discounted Invoice with an existing ID "discounted-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The Invoice with the ID "discounted-invoice" is published
        Then The Invoice with the ID "discounted-invoice" is not registered to erp
