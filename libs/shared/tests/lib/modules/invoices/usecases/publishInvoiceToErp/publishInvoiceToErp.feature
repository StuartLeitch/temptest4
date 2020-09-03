Feature: Publish invoice to erp system

    Scenario: Invoice is saved successfully to netsuite
        Given There is an existing Invoice with the ID "netsuite-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The Invoice with the ID "netsuite-invoice" is published
        Then The Invoice with the ID "netsuite-invoice" is registered to netsuite

    Scenario: Invoice is saved successfully to salesforce
        Given There is an existing Invoice with the ID "salesforce-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The Invoice with the ID "salesforce-invoice" is published
        Then The Invoice with the ID "salesforce-invoice" is registered to salesforce

    Scenario Outline: Tax code is assigned correctly
        Given There is an existing Invoice with the ID "tax-invoice"
        And The payer is from "<payerCountry>" and their type is "<payerType>"
        When The Invoice with the ID "tax-invoice" is published
        Then The tax code selected for the Invoice with the ID "tax-invoice" is <taxRate>

        Examples:
            | payerCountry | payerType   | taxRate |
            | GB           | INDIVIDUAL  | 7       |
            | GB           | INSTITUTION | 7       |
            | UK           | INDIVIDUAL  | 7       |
            | UK           | INSTITUTION | 7       |
            | RO           | INDIVIDUAL  | 7       |
            | RO           | INSTITUTION | 15      |
            | CH           | INDIVIDUAL  | 10      |
            | CH           | INSTITUTION | 10      |

    Scenario: Fully discounted invoices are not sent to sage
        Given There is an fully discounted Invoice with an existing ID "discounted-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The Invoice with the ID "discounted-invoice" is published
        Then The Invoice with the ID "discounted-invoice" is not registered to erp
