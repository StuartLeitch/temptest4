Feature: Get Credit Note By Custom Id Usecase

    @ValidateGetCreditNoteByCustomIdUsecase
    Scenario: Get Credit Note
        Given an article with the custom id "test-article"
        When we execute GetCreditNoteByCustomIdUsecase with custom id "test-article"
        Then I should receive the credit note for "test-article"