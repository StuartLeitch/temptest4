Feature: On Manuscript Reject

  Scenario: Manuscript Reject Handler
    Given Invoicing listening to events emitted by Review
    When A manuscript reject event is published
    Then The DRAFT Transaction associated with the manuscript should be soft deleted
    And The DRAFT Invoice associated with the manuscript should be soft deleted
    And The Invoice Item associated with the manuscript should be soft deleted
