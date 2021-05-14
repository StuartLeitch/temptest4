Feature: pauseInvoicePaymentReminderUsecase test

    Scenario: Pause payment reminders for invoice
        Given a notification "test-notification" and invoice "test-invoice"
        When I try to pause payment reminders for "test-invoice"
        Then the payment reminder should be paused

    Scenario: Failure when invoice has no reminder
        Given a notification "test-notification" and invoice "test-invoice"
        When I try to pause payment reminders for "another-invoice"
        Then an error should appear