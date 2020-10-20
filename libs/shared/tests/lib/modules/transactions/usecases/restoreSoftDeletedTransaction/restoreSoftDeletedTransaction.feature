Feature: Restore Soft Delete Draft Transaction Usecase
    This usecase is executed when manuscript is resubmitted

Scenario: Restore Soft Delete Draft Transaction
    Given A journal "test-journal" with a manuscript "test-manuscript"
    And A Invoice with a DRAFT Transaction and a Invoice Item tied to the manuscript "foo-manuscript"
    When RestoreSoftDeleteTransactionUsecase is executed for manuscript "foo-manuscript"
    Then The DRAFT Transaction associated with the manuscript should be restored
    And The DRAFT Invoice associated with the manuscript should be restored
    And The Invoice Item associated with the manuscript should be restored