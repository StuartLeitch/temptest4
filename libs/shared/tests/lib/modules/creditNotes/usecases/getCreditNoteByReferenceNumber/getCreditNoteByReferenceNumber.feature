Feature: Get Credit Note By Reference Number Usecase

    @ValidateGetCreditNoteByReferenceNumberUsecase
    Scenario: Get Credit Note
        Given the credit note with id "test-creditNote" and reference number "test-number"
        When I execute GetCreditNoteByReferenceNumberUsecase with "test-number"
        Then I should get the credit note

        When I execute GetCreditNoteByReferenceNumberUsecase with unexistent ref no "nonumber"
        Then I should not get the credit note