Feature: Waiver Service

  Scenario: Get WAIVED_COUNTRY waiver for correcponding author in waived countries
    Given There is a waiver for "WAIVED_COUNTRY" of "100" percent reduction
    And A submitting author is from country with code "AO"
    When Waivers are applied for manuscript on journal "testJournal123"
    Then The applied waiver is of type "WAIVED_COUNTRY" with reduction "100"

  Scenario: Get SANCTIONED_COUNTRY waiver for correcponding author in waived countries
    Given There is a waiver for "SANCTIONED_COUNTRY" of "100" percent reduction
    And A submitting author is from country with code "AF"
    When Waivers are applied for manuscript on journal "testJournal123"
    Then The applied waiver is of type "SANCTIONED_COUNTRY" with reduction "100"

  Scenario: Get EDITOR_DISCOUNT waiver if any submittion authors are editors on a journal
    Given There is a waiver for "EDITOR_DISCOUNT" of "50" percent reduction
    And An editor with email "editor@test.com" is on journal "testJournal333" with role "academicEditor"
    And Manuscript has authors with emails "author1@test.com, editor@test.com"
    When Waivers are applied for manuscript on journal "testJournal123"
    Then The applied waiver is of type "EDITOR_DISCOUNT" with reduction "50"
