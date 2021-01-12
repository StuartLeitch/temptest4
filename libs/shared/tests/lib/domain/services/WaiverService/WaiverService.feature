Feature: Waiver Service

  Scenario: Get WAIVED_COUNTRY waiver for correcponding author in waived countries
    Given There is a waiver for "WAIVED_COUNTRY" of "100" percent reduction
    And A submitting author is from waived country
    When Waivers are applied
    Then The applied waiver is of type "WAIVED_COUNTRY" with reduction "100"
