Feature: Restore Soft Delete Draft Transaction Usecase
    This usecase is executed when manuscript is resubmitted

Scenario: Restore Soft Delete Draft Transaction
    Given The journal named "test-journal" with the manuscript named "test-manuscript"
    And A Invoice in a DRAFT Transaction and a Invoice Item is linked to the manuscript "test-manuscript"
    When RestoreSoftDeleteDraftTransactionUsecase is executed for the manuscript "test-manuscript"
    Then The DRAFT Transaction tied with the manuscript should be restored
    And The DRAFT Invoice tied with the manuscript should be restored
    And The Invoice Item tied with the manuscript should be restored