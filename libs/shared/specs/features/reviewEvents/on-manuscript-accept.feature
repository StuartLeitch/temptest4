Feature: On Manuscript Accept

  Scenario: Manuscript Accept Handler
    Given Invoicing listening to events emitted by Review
    When A manuscript accept event is published
    Then The DRAFT Transaction associated with the manuscript should be updated
    And The DRAFT Invoice associated with the manuscript should be updated
    And The Invoice Item associated with the manuscript should be updated
