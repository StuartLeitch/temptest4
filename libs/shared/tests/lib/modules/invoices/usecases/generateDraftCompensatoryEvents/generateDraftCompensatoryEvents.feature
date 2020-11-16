Feature: Generate Draft Compensatory events usecase

  @GenerateDraftCompensatoryEvents
  Scenario: Usecase is called for an invoice with no reductions
    Given A manuscript with custom id "111111"
    And An invoice with id "inv-1" for manuscript "111111" with price "200"
    When GenerateDraftCompensatoryEvents is called for invoiceId "inv-1"
    Then An event of type "InvoiceDraftCreated" is generated, for invoiceId "inv-1"
