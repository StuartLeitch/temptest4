Feature: Journal Editor Removed Event Handler
  # Provide some context
  # And some other stuff

  # some comment here if necessary
  Background:
    Given a background step
  Scenario: Journal Editor Removed
    Given There are "10" editors in the Journal "foo-journal"
    And All editors list from event data contains "7" entries only
    And The journal id from event data is "foo-journal"
    When JournalEditorRemoved event is being published
    Then The journal "foo-journal" should have only "7" editors left
