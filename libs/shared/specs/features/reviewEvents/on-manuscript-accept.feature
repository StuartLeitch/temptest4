Feature: On Manuscript Accept

  Scenario: Manuscript Accept Handler
    Given Invoicing listening to events emitted by Review
    When A manuscript accept event is published
    # And The APC Catalog Item has a price of 100
    # And The Author is from a Waived Country
    Then The Transaction associated with the manuscript should be ACTIVE
# And The Invoice Item associated with the manuscript should have the price of 50
