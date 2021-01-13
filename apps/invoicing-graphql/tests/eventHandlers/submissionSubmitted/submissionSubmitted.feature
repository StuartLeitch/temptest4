Feature: Submission Submitted event handled
  # Submission Submitted event is triggered by review when a user:
  # - submitted a new article for publication
  # - moves an article already submitted from a journal to an other journal
  # - changes the articleType

  Background:
    Given There is a Journal "foo-journal" with APC "200"

  Scenario: Article is submitted for the first time and is invoiceable
    Given A "Research Article" with CustomId "111111" is submitted on journal "foo-journal"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "111111" is created
    And The invoice for CustomId "111111" has price "200"

  Scenario: Article is submitted for the first time and is non-invoiceable
    Given A "Corrigendum" with CustomId "111112" is submitted on journal "foo-journal"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "111112" is not created

  Scenario: Article is re-submitted to an other journal
    Given There is a Journal "bar-journal" with APC "300"
    And A "Research Article" with CustomId "111113" is on "foo-journal"
    And A "Research Article" with CustomId "111113" is submitted on journal "bar-journal"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "111113" has price "300"

  Scenario: Article is re-submitted with other articleType
    Given A "Research Article" with CustomId "111114" is on "foo-journal"
    And A "Corrigendum" with CustomId "111114" is submitted on journal "foo-journal"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "111114" is deleted

  Scenario: Article is re-submitted after it was soft-deleted
    Given A "Research Article" with CustomId "111115" is on "foo-journal"
    And Article with CustomId "111115" is deleted
    And A "Research Article" with CustomId "111115" is submitted on journal "foo-journal"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "111115" is restored


  Scenario Outline: Article has waivers applied if it is eligible for them
    Given There is an editor for Journal "foo-journal" with email "<editorEmail>"
    And There is a waiver for editors
    And A "Research Article" with CustomId "<customId>" is submitted on journal "foo-journal"
    And The corresponding author has email "<authorEmail>"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "<customId>" has "<waiversApplied>" waivers applied
    And The invoice for CustomId "<customId>" remains in DRAFT state

    Examples:
      | customId | editorEmail     | authorEmail         | waiversApplied |
      | 111116   | editor@test.com | editor@test.com     | 1              |
      | 111117   | editor@test.com | not_editor@test.com | 0              |

  Scenario: Article has waiver applied even if corresponding author is not eligible
    Given There is an editor for Journal "foo-journal" with email "editor@test.com"
    And There is a waiver for editors
    And A "Research Article" with CustomId "111118" is submitted on journal "foo-journal"
    And The corresponding author has email "author@test.com"
    And There is an additional author with email "editor@test.com"
    When The "Submission Submitted" event is triggered
    Then The invoice for CustomId "111118" has "1" waivers applied
    And The invoice for CustomId "111118" remains in DRAFT state
