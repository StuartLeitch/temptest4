Feature: Journal Added Event Handler
  # On Phenom JournalAdded event
  # It should add the Journal provided by event data

  Scenario: Journal Added
    Given There is no Journal registered
    When JournalAdded event is being published
    Then The journal repo should have 1 entry
