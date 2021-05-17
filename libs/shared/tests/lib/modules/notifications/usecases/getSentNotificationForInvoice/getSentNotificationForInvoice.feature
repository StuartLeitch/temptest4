Feature: getSentNotificationForInvoiceUsecase test

    Background: 
        Given the invoice with given id "test-invoice"
        And the invoice with given id "test-invoice-2"

    @ValidateGetSentNotificationForInvoice
    Scenario: Receive notifications for given invoice
        Given the notification with "notification1" id for "test-invoice"
        And the notification with "notification2" id for "test-invoice" 
        When I try to fetch notifications for invoice "test-invoice"
        Then I should receive notifications for id "test-invoice"

    @ValidateGetSentNotificationForInvoice
    Scenario: Do not to receive notifications if invoice has no notifications
        When I try to fetch notifications for invoice "test-invoice-2"
        Then I should not receive any notifications
        