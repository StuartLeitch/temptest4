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
            | GB           | INDIVIDUAL  | 53      |
            | GB           | INSTITUTION | 53      |
            | UK           | INDIVIDUAL  | 53      |
            | UK           | INSTITUTION | 53      |
            | RO           | INDIVIDUAL  | 55      |
            | RO           | INSTITUTION | 55      |
            | CH           | INDIVIDUAL  | 55      |
            | CH           | INSTITUTION | 55      |

    @ValidatePublishInvoiceToErp
    Scenario: Fully discounted invoices are not sent to sage
        Given There is an fully discounted Invoice with an existing ID "discounted-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The Invoice with the ID "discounted-invoice" is published
        Then The Invoice with the ID "discounted-invoice" is not registered to erp
