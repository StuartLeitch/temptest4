Feature: Submission Submitted event handled
  # Submission Submitted event is triggered by review when a user:
  # - submitted a new article for publication
  # - moves an article already submitted from a journal to an other journal
  # - changes the articleType

  Scenario: Article is submitted for the first time and is invoiceable
    Given There is a Journal "foo-journal" with price "200"
    And There is no article with CustomId "111111"
    And An article with CustomId "111111" is submitted
    And The articleType is "Research Article"
    When The event with EventId "envFirst" is handled
    Then The invoice for CustomId "111111" is created and has price "200"

  Scenario: Article is submitted for the first time and is non-invoiceable
    Given There is a Journal "foo-journal"
    And There is no article with CustomId "111112"
    And An article with CustomId "111111" is submitted
    And The articleType is "Corrigendum"
    When The event with EventId "envFirst" is handled
    Then The invoice for CustomId "111112" is not created

  Scenario: Article is re-submitted to an other journal
    Given There is a Journal "foo-journal" with APC "200"
    And There is a journal "bar-journal" with APC "300"
    And There is an article with CustomId "111113" on journal "foo-journal"
    And The article with CustomId "111113" is re-submitted on journal "bar-journal"
    When The event with EventId "envSecond" is handled
    Then The invoice for CustomId "111113" is updated to have price "300"

  Scenario: Article is re-submitted with other articleType
    Given There is a Journal "foo-journal"
    And There is an article with CustomId "111114" on journal "foo-journal"
    And The article with CustomId "111114" has articleType "Research Article"
    And The article with CustomId "111114" is re-submitted with articleType "Corrigendum"
    When The event with EventId "envSecond" is handled
    Then The invoice for CustomId "111114" is deleted
