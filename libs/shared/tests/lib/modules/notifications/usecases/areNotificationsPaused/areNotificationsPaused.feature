Feature: AreNotificationsPausedUsacase test 

    Scenario: For a given invoice with a notification type return paused state
        Given an invoice with id "test-invoice" with confirmation reminder notification
        When I try to get paused reminders for invoice id "test-invoice"
        Then I should receive pause status for notification with invoice id "test-invoice"

    Scenario: For a different invoice without a notification it should return an error 
        Given an invoice with id "test-invoice" with confirmation reminder notification
         When I try to get paused reminders for invoice id "different-invoice"
         Then I should not return any reminders.