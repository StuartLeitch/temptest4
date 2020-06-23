Feature: Journal Updated Event Handler
# On Phenom JournalUpdated event
# It should update the Journal with
# the new details provided by event data

# Scenario: Journal Updated
#   Given There are "10" editors in the Journal "foo-journal"
#   And All editors list from event data contains "7" entries only
#   And The journal id from event data is "foo-journal"
#   When JournalEditorRemoved event is being published
#   Then The journal "foo-journal" should have only "7" editors left
