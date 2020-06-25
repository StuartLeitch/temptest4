Feature: Update Transaction On Accept Manuscript Usecase
    This Usecase is executed when the manuscript is accepted

    Scenario: Update Transaction On Accept Manuscript
        Given A Journal "foo-journal" with the APC price of 100
        And A manuscript "foo-manuscript" which passed the review process
        When UpdateTransactionOnAcceptManuscriptUsecase is executed for manuscript "foo-manuscript"
        Then The Transaction associated with the manuscript should be ACTIVE
        And The Invoice Item associated with the manuscript should have the price of 100
