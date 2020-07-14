Feature: Delete Editor Usecase
  Blah blah blah

  # more scenario blah blah
  Scenario Outline: Delete Editor(s)
    Given There are <start> editors
    When I delete <remove> editors
    Then I should have <left> editors

    Examples:
      | start | remove | left |
      | 12    | 1      | 11   |
      | 12    | 10     | 2    |
      | 12    | 0      | 12   |
