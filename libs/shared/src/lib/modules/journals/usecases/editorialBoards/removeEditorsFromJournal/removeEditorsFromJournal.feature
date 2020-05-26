Feature: Remove Editors From Journal Usecase
  #Provide some context
  #And some other stuff

  #some comment here if necessary
  Scenario Outline: Remove Editors from Journal
    Given There is a Journal having id <journalId>
    And There are <journalStart> editors in the Journal <journalId>
    And There are <start> editors in the system
    When I delete <remove> editors from Journal <journalId>
    Then I should have <journalLeft> editors in Journal <journalId>
    And I should have <left> editors in the system

    Examples:
      | journalId | journalStart | start | remove | left | journalLeft |
      | foo       | 7            | 12    | 2      | 10   | 5           |
      | foo       | 5            | 12    | 0      | 12   | 5           |
