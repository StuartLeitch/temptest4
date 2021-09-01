Feature: Create Credit Note usecase test

    @ValidateCreateCreditNoteUsecase
    Scenario: Create a credit note for a valid invoice
        Given I have an ACTIVE invoice with the id "test-invoice"
        When I try to create a credit note for id "test-invoice" with reason BAD_DEBT
        Then the original invoice gets into final state
        And the credit note should be created