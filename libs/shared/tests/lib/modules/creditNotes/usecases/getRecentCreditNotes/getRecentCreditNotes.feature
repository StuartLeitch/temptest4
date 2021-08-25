Feature: Get Recent Credit Notes Usecase test

    @ValidateGetRecentCreditNotesUsecase
    Scenario: For a recently added credit note, I should obtain it
        Given I added the credit note "test-creditNote" with invoice id "test-invoice"
        When I execute ValidateGetRecentCreditNotesUsecase
        Then I should receive the added credit note

    @ValidateGetRecentCreditNotesUsecase
    Scenario: For no added credit note, I should obtain nothing
        Given I have no added credit notes
        When I execute ValidateGetRecentCreditNotesUsecase
        Then I should not receive any credit note