Feature: Notification Domain Entity

    @ValidateNotification
    Scenario: Create Notification
        Given There is a Notification Domain Entity
        When The Notification.create method is called for a given ID "notification-id"
        Then A new Notification is successfully created with ID "notification-id"
