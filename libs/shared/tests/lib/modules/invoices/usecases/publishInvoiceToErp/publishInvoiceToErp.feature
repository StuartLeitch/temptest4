Feature: Publish invoice to erp system

    Scenario: Invoice is saved successfully to netsuite
        Given There is an existing Invoice with the ID "netsuite-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The usecase is executed for the Invoice with the ID "netsuite-invoice"
        Then The Invoice with the ID "netsuite-invoice" is registered to netsuite
    
    Scenario: Invoice is saved successfully to salesforce
        Given There is an existing Invoice with the ID "salesforce-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The usecase is executed for the Invoice with the ID "salesforce-invoice"
        Then The Invoice with the ID "salesforce-invoice" is registered to salesforce

    Scenario Outline: Tax code is assigned correctly
        Given There is an existing Invoice with the ID "tax-invoice"
        And The payer is from "<payerCountry>" and their type is "<payerType>"
        When The usecase is executed for the Invoice with the ID "tax-invoice"
        Then The tax code selected for the Invoice with the ID "tax-invoice" is <taxRate>

        Examples:
            | payerCountry | payerType         | taxRate |
            | GB           | INDIVIDUAL        | 7       |
            | GB           | INSTITUTION       | 15      |
            | UK           | INDIVIDUAL        | 10      |
            | UK           | INSTITUTION       | 10      |
            | RO           | INDIVIDUAL        | 7       |
            | RO           | INSTITUTION       | 15      |
            | CH           | INDIVIDUAL        | 10      |
            | CH           | INSTITUTION       | 10      |

    Scenario: Fully discounted invoices are not sent to sage
        Given There is an fully discounted Invoice with an existing ID "discounted-invoice"
        And The payer is from "GB" and their type is "INDIVIDUAL"
        When The usecase is executed for the Invoice with the ID "discounted-invoice"
        Then The Invoice with the ID "discounted-invoice" is not registered to erp
