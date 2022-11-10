Feature: Soft Delete Draft Transaction Usecase
    This usecase is executed when the manuscript is rejected

    Scenario: Soft Delete Draft Transaction
        Given A journal "foo-journal" with a manuscript "foo-manuscript"
        And A Invoice with a DRAFT Transaction and a Invoice Item tied to the manuscript "foo-manuscript"
        When SoftDeleteDraftInvoiceUsecase is executed for manuscript "foo-manuscript"
        Then The DRAFT Transaction associated with the manuscript should be soft deleted
        And The DRAFT Invoice associated with the manuscript should be soft deleted
        And The Invoice Item associated with the manuscript should be soft deleted
