Feature: Are Notifications Paused Usecase test 

    Background: 
        Given an invoice with id "test-invoice" with confirmation reminder notification

    @ValidateNotificationsPaused
    Scenario: For a given invoice with a notification type return paused state
        When I try to get paused reminders for invoice id "test-invoice"
        Then I should receive pause status for notification with invoice id "test-invoice"
        
    @ValidateNotificationsPaused
    Scenario: For a different invoice without a notification it should return an error 
        When I try to get paused reminders for invoice id "different-invoice"
        Then I should not return any reminders.