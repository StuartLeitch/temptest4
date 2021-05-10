Feature: Test getSentNotificationForInvoice usecase

    Scenario: Receive notifications for given invoice
        Given a notification with "test-notification" id and invoice id "test-invoice"
        And a notification with "test-notification-2" id and invoice id "test-invoice"
        When I try to fetch notifications for invoice "test-invoice"
        Then I should receive notifications for id "test-invoice"

    Scenario: Fail to receive notifications if invoice non existent
        Given a notification with "test-notification" id and invoice id "test-invoice"
        When I try to fetch notifications for invoice "another-invoice"
        Then I should receive error
        