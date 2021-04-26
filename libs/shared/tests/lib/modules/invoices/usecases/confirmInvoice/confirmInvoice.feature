Feature: Confirm invoice
  # Confirm invoice is triggered:
  # - by the payer of the APC invoice in invoicing web
  # - by an admin when applying coupon that makes the total of the invoice 0
  # - when an article is published
  # - deprecated (hopefully): when migrating an invoice

  Scenario: Invoice is confirmed successfully
    Given There is an Invoice with the ID "normal-invoice"
    When The Payer "John" from "GB" confirms the invoice with the ID "normal-invoice"
    Then The result is successful

  Scenario: Invoice status is changed to ACTIVE after confirmation
    Given There is an Invoice with the ID "normal-invoice"
    When The Payer "John" from "GB" confirms the invoice with the ID "normal-invoice"
    Then The invoice "normal-invoice" is successfully updated to status "ACTIVE"

  Scenario: Payer is saved successfully
    Given There is an Invoice with the ID "normal-invoice"
    When The Payer "John" from "GB" confirms the invoice with the ID "normal-invoice"
    Then The Payer "John" is saved successfully for the invoice with the ID "normal-invoice"

  Scenario: Vat is applied successfully
    Given There is an Invoice with the ID "vat-invoice"
    When The Payer "John" from "GB" confirms the invoice with the ID "vat-invoice"
    Then The Invoice "vat-invoice" has vat amount greater than 0

  Scenario: Fully discounted invoice is marked as final
    Given There is a fully discounted Invoice with the ID "fully-discounted"
    When The Payer "John" from "GB" confirms the invoice with the ID "fully-discounted"
    Then The invoice "fully-discounted" is successfully updated to status "FINAL"

  Scenario: Payer from sanctioned country is not allowed to pay
    Given There is an Invoice with the ID "sanctioned-country-invoice"
    When The Payer "Fidel" from "CU" confirms the invoice with the ID "sanctioned-country-invoice"
    Then The invoice "sanctioned-country-invoice" is successfully updated to status "PENDING"

  Scenario: Invoice email is sent for sanctioned country
    Given There is an Invoice with the ID "email-invoice"
    When The Payer "Fidel" from "CU" confirms the invoice with the ID "email-invoice"
    Then The Invoice for "email-invoice" is sent by email

  Scenario: Invoice is confirmed on DRAFT transaction
    Given There is an Invoice with the ID "draft-transaction"
    Given The transaction has status "DRAFT"
    When The Payer "John" from "RO" confirms the invoice with the ID "draft-transaction"
    Then The invoice "draft-transaction" is successfully updated to status "DRAFT"
    And The response is error "ManuscriptNotAcceptedError"

  Scenario: Invoice is confirmed for the seccond time
    Given There is an Invoice with the ID "multiple-confirmations"
    When The Payer "John-one" from "RO" confirms the invoice with the ID "multiple-confirmations"
    And The Payer "John-two" from "RO" confirms the invoice with the ID "multiple-confirmations"
    And The response is error "InvoiceAlreadyConfirmedError"
