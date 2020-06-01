Feature: Get Editors By Journal Usecase
  #Provide some context
  #And some other stuff

  #some comment here if necessary
  Scenario: Get Editors By Journal
    Given There is a Journal having id foo-journal
    And There are 12 editors in the Journal foo-journal
    When I ask for the whole list of editors from Journal foo-journal
    Then I should receive 12 editors of Journal foo-journal
