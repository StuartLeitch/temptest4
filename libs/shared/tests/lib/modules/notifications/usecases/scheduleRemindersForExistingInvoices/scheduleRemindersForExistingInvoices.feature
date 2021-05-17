Feature: scheduleRemindersForExistingInvoicesUsecase test

    @ValidateScheduleReminders
    Scenario: Schedule Reminders for Invoice
        Given the Invoice "test-invoice"
        And a confirmation notification "confirmation-notification" for invoice "test-invoice"
        And a payment notification "payment-notification" for invoice "test-invoice"
        When I execute the use-case scheduleRemindersForExistingInvoicesUsecase
        Then it should schedule the reminders for the Invoice