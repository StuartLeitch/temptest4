Feature: Update Transaction On Accept Manuscript Usecase
    This Usecase is executed when the manuscript is accepted

    Scenario: Update Transaction On Accept Manuscript for a Author in a Waived Country
        Given A Journal "foo-journal" with the APC price of 1900
        And A manuscript "foo-manuscript" with the Author from "MD"
        When UpdateTransactionOnAcceptManuscriptUsecase is executed for manuscript "foo-manuscript"
        Then The Transaction associated with the manuscript should be ACTIVE
        And The Invoice Item associated with the manuscript should have the price of 0
