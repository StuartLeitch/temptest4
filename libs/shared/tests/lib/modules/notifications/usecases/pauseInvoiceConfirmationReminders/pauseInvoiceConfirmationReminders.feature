Feature: Test PauseInvoiceConfirmationRemindersUsecase

    Scenario: Pause confirmation reminders
        Given a notification "test-notification" and an invoice "test-invoice"
        When I try to pause reminders of given type for "test-invoice"
        Then the confirmation reminder should be paused

    Scenario: Failure for invoice without reminders
         Given a notification "test-notification" and an invoice "test-invoice"
          When I try to pause reminders of given type for "different-invoice"
          Then an error should occur