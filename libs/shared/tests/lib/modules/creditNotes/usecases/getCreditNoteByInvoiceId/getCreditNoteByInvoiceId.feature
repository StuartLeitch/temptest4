Feature: Get Credit Note By Invoice Id Usecase

    @ValidateGetCreditNoteByInvoiceIdUsecase
    Scenario: Get Credit Note
        Given the credit note with an invoice id "test-invoice"
        When we call GetCreditNoteByInvoiceIdUsecase with invoice id "test-creditNote"
        Then the credit note is returned