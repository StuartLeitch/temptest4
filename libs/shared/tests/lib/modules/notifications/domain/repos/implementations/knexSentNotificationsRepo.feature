Feature: Sent Notifications Repo

    Scenario: Test Notification.getNotificationById
        Given a notification with the id "test-notification" and invoice id "test-invoice"
        When we call getNotificationById for "test-notification"
        Then getNotificationById returns the Notification

    Scenario: Test Notification.getNotificationsByInvoiceId
        Given a notification with the id "test-notification" and invoice id "test-invoice"
        And a notification with the id "test-notification-1" and invoice id "test-invoice"
        When we call getNotificationsByInvoiceId with "test-invoice"
        Then getNotificationsByInvoiceId returns the 2 notifications
        When we call getNotificationsByInvoiceId with "test-invoice-1"
        Then getNotificationsByInvoiceId returns null

    Scenario: Test Notification.getNotificationsByRecipient
        Given a notification with the id "test-notification" and invoice id "test-invoice"
        And a notification with the id "test-notification-1" and invoice id "test-invoice"
        When we call getNotificationsByRecipient with "test-email"
        Then getNotificationsByRecipient returns the 2 notifications
        When we call getNotificationsByRecipient with "another-test-email"
        Then getNotificationsByRecipient returns null

    Scenario: Test Notification.getNotificationsByType
        Given a notification with the id "test-notification" and invoice id "test-invoice"
        And a notification with the id "test-notification-1" and invoice id "test-invoice"
        When we call getNotificationsByType with "REMINDER_CONFIRMATION"
        Then getNotificationsByType returns the 2 notifications
        When we call getNotificationsByType with "INVOICE_CREATED"
        Then getNotificationsByType returns null