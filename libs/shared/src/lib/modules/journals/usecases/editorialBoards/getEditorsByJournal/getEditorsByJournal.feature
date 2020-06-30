Feature: Get Editors By Journal Usecase
  The system is able to retrieve the full list of Editors attached to a certain Journal
  through GetEditorsByJournal usecase

  Scenario: Get Editors By Journal
    Given There is a Journal with id "foo-journal" and 12 editors
    When I ask for the whole list of editors from Journal "foo-journal"
    Then I should receive 12 editors of Journal "foo-journal"
