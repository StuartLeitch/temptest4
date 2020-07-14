Feature: Journal Editor Assigend Event Handler
    On Phenom JournalEditorAssigned event
    It should add a list of editors to that journal
    with the new list provided by event data

    Scenario: Journal Editor Assigned
        Given There is a Journal "foo-journal"
        And The journal id from the JournalEditorAssigned event data is "foo-journal"
        And All editors list from event data contains 10 entries
        When "JournalEditorAssigned" event is being published
        Then The journal "foo-journal" should have only 10 editors assigned