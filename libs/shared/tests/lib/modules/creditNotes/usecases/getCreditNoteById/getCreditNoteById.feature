Feature: Get Credit Note By Id Usecase

    @ValidateGetCreditNoteByIdUsecase
    Scenario: Get Credit Note
        Given a credit note with the id "test-creditNote"
        When GetCreditNoteByIdUsecase is executed for credit note "test-creditNote"
        Then the credit note will be returned