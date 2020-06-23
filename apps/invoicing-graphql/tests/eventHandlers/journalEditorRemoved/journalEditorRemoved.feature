Feature: Journal Editor Removed Event Handler
  # On Phenom JournalEditorRemoved event
  # It should replace the list of editors attached to that journal
  # with the new list provided by event data

  Scenario: Journal Editor Removed
    Given There are "10" editors in the Journal "foo-journal"
    And All editors list from event data contains "7" entries only
    And The journal id from event data is "foo-journal"
    When JournalEditorRemoved event is being published
    Then The journal "foo-journal" should have only "7" editors left

# Scenario: Journal Editor Removed
#   Given There are "0" editors in the Journal "foo-journal"
#   And All editors list from event data contains "0" entries only
#   And The journal id from event data is "foo-journal"
#   When JournalEditorRemoved event is being published
#   Then The journal "foo-journal" should have only "0" editors left
