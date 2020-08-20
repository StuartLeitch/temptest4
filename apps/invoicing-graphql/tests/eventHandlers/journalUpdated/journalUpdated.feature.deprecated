Feature: Journal Updated Event Handler
  # On Phenom JournalUpdated event
  # It should update the Journal with
  # the new details provided by event data

  Scenario: Journal Updated
    Given There is the Journal "foo-journal"
    # And Journal "foo-journal"
    When JournalUpdated event is being published
    Then The journal "foo-journal" should be updated
