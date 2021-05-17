Feature: pauseInvoicePaymentReminderUsecase test

    Background:
        Given invoice with the "test-invoice" id
        And invoice with the "test-invoice-2" id

    @ValidatePauseInvoicePaymentReminders
    Scenario: Pause payment reminders for invoice
        Given a notification with "notificationId" id for the invoice "test-invoice"
        When I try to pause payment reminders for "test-invoice"
        Then the payment reminder should be paused

    @ValidatePauseInvoicePaymentReminders
    Scenario: Failure when invoice has no reminder
        When I try to pause payment reminders for "test-invoice-2"
        Then the error that no pause state exists for reminder occurs