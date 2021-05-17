Feature: resumeInvoicePaymentReminderUsecase test

    @ValidateResumeInvoicePaymentReminders
    Scenario: Resume payment reminders for given invoice
        Given the invoice with the id "test-invoice"
        And a notification "test-notification" for invoice "test-invoice"
        When I try to resume payment reminders for "test-invoice"
        Then it should resume the reminders of type payment

    @ValidateResumeInvoicePaymentReminders
    Scenario: Don't resume reminders for paid invoice
        Given the invoice with the id "paid-invoice"
        And a notification "paid-notification" for paid invoice "paid-invoice"
        When I try to resume payment reminders for "paid-invoice"
        Then it should not resume the reminder