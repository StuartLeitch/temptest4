Feature: Publish revenue recognition to erp system

    Scenario: Revenue recognition is saved successfully to salesforce
        Given There is an Invoice with the ID "salesforce-invoice" created
        And The payer country is "GB" and their type is "INDIVIDUAL"
        When Revenue recognition usecase is execute for the invoice with the ID "salesforce-invoice"
        Then Revenue recognition for the Invoice with the ID "salesforce-invoice" is registered to salesforce

    Scenario: Revenue recognition is skipped for fully discounted invoices
        Given There is a fully discounted Invoice with the ID "discounted-invoice" created
        And The payer country is "GB" and their type is "INDIVIDUAL"
        When Revenue recognition usecase is execute for the invoice with the ID "discounted-invoice"
        Then Revenue recognition for the Invoice with the ID "discounted-invoice" is not registered
