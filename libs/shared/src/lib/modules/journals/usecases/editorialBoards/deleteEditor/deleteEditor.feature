Feature: Delete Editor Usecase
  #Provide some context
  #And some other stuff

  #some comment here if necessary
  Scenario Outline: Delete
    Given There are <start> editors
    When I delete <remove> editors
    Then I should have <left> editors

    Examples:
      | start | remove | left |
      | 12    | 1      | 11   |
      | 12    | 10     | 2    |
      | 12    | 0      | 12   |
