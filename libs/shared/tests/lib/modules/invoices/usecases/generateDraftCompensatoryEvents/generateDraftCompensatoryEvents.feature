Feature: Generate Draft Compensatory events usecase

  @GenerateDraftCompensatoryEvents
  Scenario: Usecase is called for an invoice with no reductions
    Given A manuscript with custom id "111111"
    And An invoice with id "inv-1" for manuscript "111111" with price "200"
    When GenerateDraftCompensatoryEvents is called for invoiceId "inv-1"
    Then An event of type "InvoiceDraftCreated" is generated, for invoiceId "inv-1"

  @GenerateDraftCompensatoryEvents
  Scenario: Usecase is called for an invoice with waiver applied upon submission
    Given A manuscript with custom id "111112"
    And An invoice with id "inv-2" for manuscript "111112" with price "200"
    And A waiver applied at "Submission" on invoiceId "inv-2"
    When GenerateDraftCompensatoryEvents is called for invoiceId "inv-2"
    Then An event of type "InvoiceDraftCreated" is generated, for invoiceId "inv-2"
    And "InvoiceDraftCreated" event has "1" waivers in message and reduction calculated

  @GenerateDraftCompensatoryEvents
  Scenario: Usecase is called for an invoice with waiver applied after submission
    Given A manuscript with custom id "111113"
    And An invoice with id "inv-3" for manuscript "111113" with price "200"
    And A waiver applied at "Update" on invoiceId "inv-3"
    When GenerateDraftCompensatoryEvents is called for invoiceId "inv-3"
    Then An event of type "InvoiceDraftCreated" is generated, for invoiceId "inv-3"
    And An event of type "InvoiceDraftDueAmountUpdated" is generated, for invoiceId "inv-3"
    And "InvoiceDraftCreated" event has "0" waivers in message and reduction calculated
    And "InvoiceDraftDueAmountUpdated" event has "1" waivers in message and reduction calculated
