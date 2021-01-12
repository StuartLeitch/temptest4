Feature: Waiver Service

  Background:
    Given There is a waiver for "WAIVED_CHIEF_EDITOR" of "100" percent reduction
    And There is a waiver for "SANCTIONED_COUNTRY" of "100" percent reduction
    And There is a waiver for "EDITOR_DISCOUNT" of "50" percent reduction
    And There is a waiver for "WAIVED_COUNTRY" of "100" percent reduction
    And There is a waiver for "WAIVED_EDITOR" of "100" percent reduction

  @ValidateWaiverService
  Scenario: Get WAIVED_COUNTRY waiver for correcponding author in waived countries
    Given A submitting author is from country with code "AO"
    When Waivers are applied for manuscript on journal "submittionJournal"
    Then The applied waiver is of type "WAIVED_COUNTRY" with reduction "100"

  @ValidateWaiverService
  Scenario: Get SANCTIONED_COUNTRY waiver for correcponding author in waived countries
    Given A submitting author is from country with code "CU"
    When Waivers are applied for manuscript on journal "submittionJournal"
    Then The applied waiver is of type "SANCTIONED_COUNTRY" with reduction "100"

  @ValidateWaiverService
  Scenario Outline: Editors discount
    Given An editor with email "<editorEmail>" is on journal "<editorJournal>" with role "<editorRole>"
    And Manuscript has authors with emails "author1@test.com, editor@test.com"
    When Waivers are applied for manuscript on journal "submittionJournal"
    Then The applied waiver is of type "<appliedWaiver>" with reduction "<appliedDiscount>"

    Examples:
      | editorEmail     | editorJournal     | editorRole     | appliedWaiver       | appliedDiscount |
      | editor@test.com | otherJournal      | academicEditor | EDITOR_DISCOUNT     | 50              |
      | editor@test.com | submittionJournal | academicEditor | WAIVED_EDITOR       | 100             |
      | editor@test.com | otherJournal      | triageEditor   | WAIVED_CHIEF_EDITOR | 100             |
      | editor@test.com | submittionJournal | triageEditor   | WAIVED_CHIEF_EDITOR | 100             |

  @ValidateWaiverService
  Scenario: When multiple editor waivers avaliable the one with biggest discount is selected
    Given An editor with email "other_editor@test.com" is on journal "otherJournal" with role "academicEditor"
    Given An editor with email "editor@test.com" is on journal "submittionJournal" with role "academicEditor"
    And Manuscript has authors with emails "editor@test.com, other_editor@test.com"
    When Waivers are applied for manuscript on journal "submittionJournal"
    Then The applied waiver is of type "WAIVED_EDITOR" with reduction "100"

  @ValidateWaiverService
  Scenario: When multiple waivers avaliable the one with biggest discount is selected
    Given An editor with email "editor@test.com" is on journal "otherJournal" with role "academicEditor"
    And A submitting author is from country with code "AO"
    And Manuscript has authors with emails "author@test.com, editor@test.com"
    When Waivers are applied for manuscript on journal "submittionJournal"
    Then The applied waiver is of type "WAIVED_COUNTRY" with reduction "100"

  @ValidateWaiverService
  Scenario: applyHighestReductionWaiver should return the waiver with highest reduction
    Given Waiver of type "WAIVED_COUNTRY" should apply
    And Waiver of type "EDITOR_DISCOUNT" should apply
    When applyHighestReductionWaiver is called
    Then The applied waiver is of type "WAIVED_COUNTRY" with reduction "100"
