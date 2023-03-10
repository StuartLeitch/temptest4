Feature: Pause Invoice Confirmation Reminders Usecase test

    Background:
        Given the invoice "testInvoice" id
        And the invoice "testInvoice-2" id

    @ValidatePauseInvoiceConfirmationReminders
    Scenario: Pause confirmation reminders
        And notification with "notificationId" for invoice "testInvoice"
        When I try to pause reminders of given type for "testInvoice"
        Then the confirmation reminder should be paused

    @ValidatePauseInvoiceConfirmationReminders
    Scenario: Failure for invoice without reminders
          When I try to pause reminders of given type for "testInvoice-2"
          Then an error should occur saying the pause state does not exist