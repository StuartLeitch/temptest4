Feature: Register Revenue Recognition in ERP
  Some ERP systems require multiple attempts
  when register invoices or revenue recognition.

  Scenario: Credit Note created
    Given There is an Invoice with the ID "normal-invoice"
    When A credit note is created from it
    And The manuscript associated with the invoice is published
    Then It should not enlist the credit note for revenue recognition
