Feature: Remove Editors From Journal Usecase
  # The system is able to remove Editors attached to a certain Journal
  # through RemoveEditorsFromJournal usecase

  Scenario Outline: Remove Editors from Journal
    Given There is a Journal having id <journalId> with <journalStartEditors> editors
    And There are <systemStartEditors> editors in the system
    When I delete <journalRemoveEditors> editors from Journal <journalId>
    Then I should have <journalLeftEditors> editors in Journal <journalId>
    And I should have <systemLeftEditors> editors in the system

    Examples:
      | journalId | journalStartEditors | systemStartEditors | journalRemoveEditors | journalLeftEditors | systemLeftEditors |
      | foo       | 7                   | 12                 | 2                    | 5                  | 10                |
      | foo       | 5                   | 12                 | 0                    | 5                  | 12                |
