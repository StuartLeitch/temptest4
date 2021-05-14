Feature: getRemindersPauseStateForInvoiceUsecase test

    Scenario: Fetch reminders for a certain invoice
        Given an invoice "test-invoice"
        When I try to fetch paused reminders for invoice "test-invoice"
        Then I should receive reminders

    Scenario: Calling the usecase for a different invoice
         Given an invoice "test-invoice"
         When I try to fetch paused reminders for invoice "different-invoice"
         Then I should obtain an error