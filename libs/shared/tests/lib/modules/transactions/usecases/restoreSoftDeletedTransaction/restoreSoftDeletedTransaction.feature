Feature: Restore Soft Delete Draft Transaction Usecase
    This usecase is executed when manuscript is resubmitted
    # Restore means the deleted value of a Transaction, Manuscript, Invoice are changed to 0

    Scenario: Restore Soft Delete Draft Transaction
        Given A resubmitted manuscript "test-manuscript" on journal "test-journal"
        And An Invoice with a DRAFT Transaction and an Invoice Item linked to the manuscript "test-manuscript"
        And The manuscript with id "test-manuscript" is withdrawn
        When RestoreSoftDeleteDraftTransactionUsecase executes for manuscript "test-manuscript"
        Then The DRAFT Transaction tied with the manuscript should be restored
        And The DRAFT Invoice tied with the manuscript should be restored
        And The Invoice Item tied with the manuscript should be restored
        And The Manuscript should be restored
