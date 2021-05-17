Feature: addEmptyStateForInvoiceUsecase test

    Background:
        Given an invoice with the id "test-invoice"

    @ValidateEmptyStateForInvoice
    Scenario: Add empty pause state for an invoice reminder
        When I try to insert a new empty pause reminder with invoice id "test-invoice"
        Then the empty pause reminder for invoice "test-invoice" should be added

    @ValidateEmptyStateForInvoice
    Scenario: Reminder not added for unknown invoice
        When I try to insert a new empty pause reminder with invoice id "test-2"
        Then I should receive an error that the invoice was not found